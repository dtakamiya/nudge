import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import { updateActionItemStatus } from "../action-item-actions";
import {
  getConditionAlertMembers,
  getDashboardSummary,
  getHealthScore,
} from "../dashboard-actions";
import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

beforeEach(async () => {
  await cleanDatabase();
});

describe("getDashboardSummary", () => {
  it("returns zeros when no data exists", async () => {
    const summary = await getDashboardSummary();
    expect(summary).toEqual({
      needsFollowUp: 0,
      actionCompletionRate: 0,
      totalActions: 0,
      completedActions: 0,
      meetingsThisMonth: 0,
      overdueActions: 0,
    });
  });

  it("counts members needing follow-up (no meeting in 14+ days)", async () => {
    const member1Result = await createMember({ name: "Recent" });
    const member2Result = await createMember({ name: "Old" });
    await createMember({ name: "Never" });
    if (!member1Result.success) throw new Error(member1Result.error);
    if (!member2Result.success) throw new Error(member2Result.error);

    // member1: meeting today
    await createMeeting({
      memberId: member1Result.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // member2: meeting 15 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);
    await createMeeting({
      memberId: member2Result.data.id,
      date: oldDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    // member3: no meeting at all

    const summary = await getDashboardSummary();
    expect(summary.needsFollowUp).toBe(2); // member2 + member3
  });

  it("calculates action completion rate", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Done Task", description: "" },
        { title: "Todo Task", description: "" },
        { title: "Progress Task", description: "" },
        { title: "Done Task 2", description: "" },
      ],
    });
    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");
    await updateActionItemStatus(items[3].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.totalActions).toBe(4);
    expect(summary.completedActions).toBe(2);
    expect(summary.actionCompletionRate).toBe(50);
  });

  it("counts meetings this month", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);

    // This month
    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // Last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    await createMeeting({
      memberId: memberResult.data.id,
      date: lastMonth.toISOString(),
      topics: [],
      actionItems: [],
    });

    const summary = await getDashboardSummary();
    expect(summary.meetingsThisMonth).toBe(1);
  });

  it("counts overdue actions", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue", description: "", dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", dueDate: tomorrow.toISOString() },
        { title: "No due", description: "" },
      ],
    });

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(1);
  });

  it("does not count completed items as overdue", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        {
          title: "Overdue but done",
          description: "",
          dueDate: yesterday.toISOString(),
        },
      ],
    });

    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(0);
  });
});

describe("getHealthScore", () => {
  it("メンバーが0人の場合はスコア100・各カウント0を返す", async () => {
    const result = await getHealthScore();
    expect(result.score).toBe(100);
    expect(result.healthyCount).toBe(0);
    expect(result.warningCount).toBe(0);
    expect(result.dangerCount).toBe(0);
    expect(result.memberStatuses).toHaveLength(0);
  });

  it("全メンバーが健全な場合はスコア100を返す", async () => {
    const r1 = await createMember({ name: "A" });
    const r2 = await createMember({ name: "B" });
    if (!r1.success || !r2.success) throw new Error("member creation failed");

    // 両メンバーとも直近でミーティング済み（超過なし）
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 1);
    await createMeeting({
      memberId: r1.data.id,
      date: recentDate.toISOString(),
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: r2.data.id,
      date: recentDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getHealthScore();
    expect(result.score).toBe(100);
    expect(result.healthyCount).toBe(2);
    expect(result.warningCount).toBe(0);
    expect(result.dangerCount).toBe(0);
  });

  it("ミーティング未実施のメンバーは danger になる", async () => {
    const r1 = await createMember({ name: "NoMeeting" });
    if (!r1.success) throw new Error("member creation failed");
    // ミーティングなし

    const result = await getHealthScore();
    expect(result.dangerCount).toBe(1);
    expect(result.score).toBe(0);
    const status = result.memberStatuses.find((s) => s.name === "NoMeeting");
    expect(status?.status).toBe("danger");
  });

  it("危険・注意・健全が混在する場合のスコアを計算する", async () => {
    const r1 = await createMember({ name: "Healthy" });
    const r2 = await createMember({ name: "Warning" });
    const r3 = await createMember({ name: "Danger" });
    if (!r1.success || !r2.success || !r3.success) throw new Error("member creation failed");

    // Healthy: 直近ミーティング（超過なし）
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 1);
    await createMeeting({
      memberId: r1.data.id,
      date: recentDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    // Warning: 4〜7日超過 (interval=14, last=18日前 → next=4日前)
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - 18);
    await createMeeting({
      memberId: r2.data.id,
      date: warningDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    // Danger: ミーティングなし
    // r3 has no meeting

    const result = await getHealthScore();
    expect(result.healthyCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.dangerCount).toBe(1);
    // スコア = healthy(1) / total(3) * 100 = 33
    expect(result.score).toBe(33);
  });

  it("memberStatuses に id・name・status・overdueDays が含まれる", async () => {
    const r = await createMember({ name: "Test" });
    if (!r.success) throw new Error("member creation failed");

    const result = await getHealthScore();
    expect(result.memberStatuses).toHaveLength(1);
    const s = result.memberStatuses[0];
    expect(s).toHaveProperty("id");
    expect(s).toHaveProperty("name", "Test");
    expect(s).toHaveProperty("status");
    expect(s).toHaveProperty("overdueDays");
  });
});

describe("getConditionAlertMembers", () => {
  it("メンバーが0人の場合は空配列を返す", async () => {
    const result = await getConditionAlertMembers();
    expect(result).toEqual([]);
  });

  it("チェックインデータ不足（1回のみ）の場合は空配列を返す", async () => {
    const r = await createMember({ name: "OneTime" });
    if (!r.success) throw new Error("member creation failed");
    await createMeeting({
      memberId: r.data.id,
      date: new Date().toISOString(),
      mood: 4,
      conditionMood: 4,
      conditionHealth: 4,
      conditionWorkload: 3,
      topics: [],
      actionItems: [],
    });

    const result = await getConditionAlertMembers();
    expect(result).toEqual([]);
  });

  it("気分が連続低下しているメンバーを検出する", async () => {
    const r = await createMember({ name: "Declining" });
    if (!r.success) throw new Error("member creation failed");

    // 古い順に作成（日付でソートするため）
    const dates = [new Date("2026-02-20"), new Date("2026-02-23"), new Date("2026-02-26")];
    for (let i = 0; i < dates.length; i++) {
      await createMeeting({
        memberId: r.data.id,
        date: dates[i].toISOString(),
        mood: 5 - i, // 5 → 4 → 3（連続低下）
        topics: [],
        actionItems: [],
      });
    }

    const result = await getConditionAlertMembers();
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe("Declining");
    expect(result[0].alerts.length).toBeGreaterThanOrEqual(1);
    const moodAlert = result[0].alerts.find((a) => a.type === "mood");
    expect(moodAlert).toBeDefined();
    expect(moodAlert!.trend).toBe("declining");
  });

  it("気分が低値のメンバーを検出する", async () => {
    const r = await createMember({ name: "LowMood" });
    if (!r.success) throw new Error("member creation failed");

    const dates = [new Date("2026-02-23"), new Date("2026-02-26")];
    await createMeeting({
      memberId: r.data.id,
      date: dates[0].toISOString(),
      mood: 3,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: r.data.id,
      date: dates[1].toISOString(),
      mood: 2, // 閾値（2）以下
      topics: [],
      actionItems: [],
    });

    const result = await getConditionAlertMembers();
    expect(result).toHaveLength(1);
    const moodAlert = result[0].alerts.find((a) => a.type === "mood");
    expect(moodAlert).toBeDefined();
    expect(moodAlert!.trend).toBe("low");
  });

  it("コンディション（健康状態）の低下も検出する", async () => {
    const r = await createMember({ name: "HealthDecline" });
    if (!r.success) throw new Error("member creation failed");

    const dates = [new Date("2026-02-23"), new Date("2026-02-26")];
    await createMeeting({
      memberId: r.data.id,
      date: dates[0].toISOString(),
      mood: 4,
      conditionHealth: 5,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: r.data.id,
      date: dates[1].toISOString(),
      mood: 4,
      conditionHealth: 3, // 5 → 3（低下）
      topics: [],
      actionItems: [],
    });

    const result = await getConditionAlertMembers();
    expect(result).toHaveLength(1);
    const healthAlert = result[0].alerts.find((a) => a.type === "conditionHealth");
    expect(healthAlert).toBeDefined();
    expect(healthAlert!.trend).toBe("declining");
  });

  it("すべてのスコアが安定しているメンバーは含まない", async () => {
    const r = await createMember({ name: "Stable" });
    if (!r.success) throw new Error("member creation failed");

    const dates = [new Date("2026-02-23"), new Date("2026-02-26")];
    for (const date of dates) {
      await createMeeting({
        memberId: r.data.id,
        date: date.toISOString(),
        mood: 4,
        conditionMood: 4,
        conditionHealth: 4,
        conditionWorkload: 3,
        topics: [],
        actionItems: [],
      });
    }

    const result = await getConditionAlertMembers();
    expect(result).toEqual([]);
  });

  it("複数メンバーの中からアラート対象のみ返す", async () => {
    const stable = await createMember({ name: "Stable" });
    const declining = await createMember({ name: "Declining" });
    if (!stable.success || !declining.success) throw new Error("member creation failed");

    const dates = [new Date("2026-02-23"), new Date("2026-02-26")];

    // Stable: 安定
    for (const date of dates) {
      await createMeeting({
        memberId: stable.data.id,
        date: date.toISOString(),
        mood: 4,
        topics: [],
        actionItems: [],
      });
    }

    // Declining: 低下
    await createMeeting({
      memberId: declining.data.id,
      date: dates[0].toISOString(),
      mood: 5,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: declining.data.id,
      date: dates[1].toISOString(),
      mood: 3,
      topics: [],
      actionItems: [],
    });

    const result = await getConditionAlertMembers();
    expect(result).toHaveLength(1);
    expect(result[0].memberName).toBe("Declining");
  });
});
