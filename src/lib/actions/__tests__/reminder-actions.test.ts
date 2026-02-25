import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";
import { getActionItemsDueSoon, getOverdueReminders } from "../reminder-actions";

beforeEach(async () => {
  await cleanDatabase();
});

describe("getOverdueReminders", () => {
  it("メンバーが0人の場合は空配列を返す", async () => {
    const result = await getOverdueReminders();
    expect(result).toEqual([]);
  });

  it("全員が期間内にミーティングしている場合は空配列を返す", async () => {
    const memberResult = await createMember({ name: "Recent", meetingIntervalDays: 14 });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    expect(result).toEqual([]);
  });

  it("デフォルト間隔（14日）を超えたメンバーを返す", async () => {
    const memberResult = await createMember({ name: "Old Member" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    await createMeeting({
      memberId: memberResult.data.id,
      date: fifteenDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe("Old Member");
    expect(result[0].daysSinceLastMeeting).toBe(15);
    expect(result[0].meetingIntervalDays).toBe(14);
  });

  it("カスタム間隔（7日）を超えたメンバーを返す", async () => {
    const memberResult = await createMember({ name: "Weekly Member", meetingIntervalDays: 7 });
    if (!memberResult.success) throw new Error(memberResult.error);

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    await createMeeting({
      memberId: memberResult.data.id,
      date: tenDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe("Weekly Member");
    expect(result[0].daysSinceLastMeeting).toBe(10);
    expect(result[0].meetingIntervalDays).toBe(7);
  });

  it("カスタム間隔（30日）の場合、15日後は期限内として除外する", async () => {
    const memberResult = await createMember({ name: "Monthly Member", meetingIntervalDays: 30 });
    if (!memberResult.success) throw new Error(memberResult.error);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    await createMeeting({
      memberId: memberResult.data.id,
      date: fifteenDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    expect(result).toEqual([]);
  });

  it("一度もミーティングをしていないメンバーを返す", async () => {
    const memberResult = await createMember({ name: "Never Met" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const result = await getOverdueReminders();
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe("Never Met");
    expect(result[0].daysSinceLastMeeting).toBeNull();
  });

  it("複数メンバーを経過日数（降順）でソートして返す", async () => {
    const m1Result = await createMember({ name: "Member A" }); // 20日超過
    const m2Result = await createMember({ name: "Member B" }); // 30日超過
    const m3Result = await createMember({ name: "Member C" }); // 未ミーティング
    if (!m1Result.success || !m2Result.success || !m3Result.success) {
      throw new Error("Failed to create members");
    }

    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await createMeeting({
      memberId: m1Result.data.id,
      date: twentyDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: m2Result.data.id,
      date: thirtyDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    expect(result).toHaveLength(3);
    // null（未ミーティング）は最後にソート
    expect(result[0].memberName).toBe("Member B"); // 30日
    expect(result[1].memberName).toBe("Member A"); // 20日
    expect(result[2].memberName).toBe("Member C"); // null
  });

  it("返り値の型が正しい", async () => {
    const memberResult = await createMember({ name: "Test Member", meetingIntervalDays: 7 });
    if (!memberResult.success) throw new Error(memberResult.error);

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    await createMeeting({
      memberId: memberResult.data.id,
      date: tenDaysAgo.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getOverdueReminders();
    const item = result[0];
    expect(item).toMatchObject({
      memberId: expect.any(String),
      memberName: expect.any(String),
      meetingIntervalDays: expect.any(Number),
      daysSinceLastMeeting: expect.any(Number),
    });
  });
});

describe("getActionItemsDueSoon", () => {
  it("アクションアイテムがない場合は空配列を返す", async () => {
    const result = await getActionItemsDueSoon();
    expect(result).toEqual([]);
  });

  it("期限なしのアクションアイテムは含まない", async () => {
    const memberResult = await createMember({ name: "テストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "期限なしタスク", description: "" }],
    });

    const result = await getActionItemsDueSoon();
    expect(result).toEqual([]);
  });

  it("完了済みアクションアイテムは含まない", async () => {
    const memberResult = await createMember({ name: "テストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meetingResult = await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "完了済みタスク", description: "", dueDate: today.toISOString() }],
    });
    if (!meetingResult.success) throw new Error(meetingResult.error);

    // 完了済みにする
    await prisma.actionItem.updateMany({
      where: { meetingId: meetingResult.data.id },
      data: { status: "DONE" },
    });

    const result = await getActionItemsDueSoon();
    expect(result).toEqual([]);
  });

  it("期限が今日のアクションアイテムを返す", async () => {
    const memberResult = await createMember({ name: "田中太郎" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "今日締め切りタスク", description: "", dueDate: today.toISOString() }],
    });

    const result = await getActionItemsDueSoon();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("今日締め切りタスク");
    expect(result[0].memberName).toBe("田中太郎");
    expect(result[0].isOverdue).toBe(false);
  });

  it("期限が明日のアクションアイテムを返す", async () => {
    const memberResult = await createMember({ name: "鈴木次郎" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "明日締め切りタスク", description: "", dueDate: tomorrow.toISOString() },
      ],
    });

    const result = await getActionItemsDueSoon();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("明日締め切りタスク");
    expect(result[0].memberName).toBe("鈴木次郎");
    expect(result[0].isOverdue).toBe(false);
  });

  it("期限切れ（昨日以前）のアクションアイテムを返す（isOverdue=true）", async () => {
    const memberResult = await createMember({ name: "佐藤三郎" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "期限切れタスク", description: "", dueDate: yesterday.toISOString() }],
    });

    const result = await getActionItemsDueSoon();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("期限切れタスク");
    expect(result[0].isOverdue).toBe(true);
  });

  it("期限が2日以上先のアクションアイテムは含まない", async () => {
    const memberResult = await createMember({ name: "テストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "将来のタスク", description: "", dueDate: dayAfterTomorrow.toISOString() },
      ],
    });

    const result = await getActionItemsDueSoon();
    expect(result).toEqual([]);
  });

  it("返り値の型が正しい", async () => {
    const memberResult = await createMember({ name: "型チェックメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "型チェックタスク", description: "", dueDate: today.toISOString() }],
    });

    const result = await getActionItemsDueSoon();
    expect(result[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      dueDate: expect.any(Date),
      memberId: expect.any(String),
      memberName: expect.any(String),
      isOverdue: expect.any(Boolean),
    });
  });
});
