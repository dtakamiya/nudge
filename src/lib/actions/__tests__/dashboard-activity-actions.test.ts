import { beforeEach,describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import { updateActionItemStatus } from "../action-item-actions";
import { getRecentActivity, getUpcomingActions } from "../dashboard-actions";
import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("getRecentActivity", () => {
  it("データなしの場合は空配列を返す", async () => {
    const result = await getRecentActivity();
    expect(result).toEqual([]);
  });

  it("最近のミーティングをアクティビティとして返す", async () => {
    const memberResult = await createMember({ name: "田中太郎" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    const activities = await getRecentActivity();
    expect(activities).toHaveLength(1);
    expect(activities[0].type).toBe("meeting");
    expect(activities[0].memberName).toBe("田中太郎");
  });

  it("完了したアクションアイテムをアクティビティとして返す", async () => {
    const memberResult = await createMember({ name: "鈴木花子" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "完了タスク", description: "" }],
    });

    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");

    const activities = await getRecentActivity();
    const actionActivities = activities.filter((a) => a.type === "action");
    expect(actionActivities).toHaveLength(1);
    expect(actionActivities[0].memberName).toBe("鈴木花子");
    if (actionActivities[0].type === "action") {
      expect(actionActivities[0].title).toBe("完了タスク");
    }
  });

  it("未完了アクションはアクティビティに含まれない", async () => {
    const memberResult = await createMember({ name: "テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "未完了タスク", description: "" }],
    });

    const activities = await getRecentActivity();
    const actionActivities = activities.filter((a) => a.type === "action");
    expect(actionActivities).toHaveLength(0);
  });

  it("最大8件に制限される", async () => {
    const memberResult = await createMember({ name: "テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    // 6ミーティング + 6完了アクションを作成 → 8件に絞られる
    for (let i = 0; i < 6; i++) {
      await createMeeting({
        memberId: memberResult.data.id,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        topics: [],
        actionItems: [{ title: `タスク${i}`, description: "" }],
      });
    }
    const items = await prisma.actionItem.findMany();
    for (const item of items) {
      await updateActionItemStatus(item.id, "DONE");
    }

    const activities = await getRecentActivity();
    expect(activities.length).toBeLessThanOrEqual(8);
  });
});

describe("getUpcomingActions", () => {
  it("データなしの場合は空オブジェクトを返す", async () => {
    const result = await getUpcomingActions();
    expect(result.today).toEqual([]);
    expect(result.thisWeek).toEqual([]);
  });

  it("今日が期限のアクションを today に含める", async () => {
    const memberResult = await createMember({ name: "田中太郎" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const todayNoon = new Date();
    todayNoon.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "今日締め切り", description: "", dueDate: todayNoon.toISOString() }],
    });

    const result = await getUpcomingActions();
    expect(result.today).toHaveLength(1);
    expect(result.today[0].title).toBe("今日締め切り");
    expect(result.today[0].memberName).toBe("田中太郎");
  });

  it("今週が期限のアクションを thisWeek に含める", async () => {
    const memberResult = await createMember({ name: "鈴木花子" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    threeDaysLater.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "今週締め切り", description: "", dueDate: threeDaysLater.toISOString() },
      ],
    });

    const result = await getUpcomingActions();
    expect(result.thisWeek).toHaveLength(1);
    expect(result.thisWeek[0].title).toBe("今週締め切り");
  });

  it("完了済みアクションは含まれない", async () => {
    const memberResult = await createMember({ name: "テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const todayNoon = new Date();
    todayNoon.setHours(12, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "完了済み", description: "", dueDate: todayNoon.toISOString() }],
    });

    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");

    const result = await getUpcomingActions();
    expect(result.today).toHaveLength(0);
  });

  it("期限なしのアクションは含まれない", async () => {
    const memberResult = await createMember({ name: "テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "期限なし", description: "" }],
    });

    const result = await getUpcomingActions();
    expect(result.today).toHaveLength(0);
    expect(result.thisWeek).toHaveLength(0);
  });
});
