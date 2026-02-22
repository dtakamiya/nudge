import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getOverdueReminders } from "../reminder-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
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
