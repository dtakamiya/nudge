import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import {
  getAllMembersWithInterval,
  getCheckinTrend,
  getDepartments,
  getMeetingFrequencyByMonth,
  getMemberActionTrends,
  getMemberMeetingHeatmap,
  getRecommendedAndScheduledMeetings,
  getRecommendedMeetings,
  getScheduledMeetingsThisWeek,
} from "../analytics-actions";
import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

beforeEach(async () => {
  await cleanDatabase();
});

describe("getMemberActionTrends", () => {
  it("calculates correct metrics with no action items", async () => {
    const member = await createMember({
      name: "Test Member",
      department: "Test",
      position: "Test",
    });
    if (!member.success) throw new Error("Member creation failed");

    const result = await getMemberActionTrends(member.data.id);
    expect(result.averageCompletionDays).toBe(0);
    expect(result.onTimeCompletionRate).toBe(0);
    expect(result.monthlyTrends).toHaveLength(0);
  });

  it("calculates metrics for action items correctly", async () => {
    const member = await createMember({
      name: "Test Member",
      department: "Test",
      position: "Test",
    });
    if (!member.success) throw new Error("Member creation failed");

    const meetingDate = new Date("2026-02-15T10:00:00Z");

    const meeting = await prisma.meeting.create({
      data: {
        memberId: member.data.id,
        date: meetingDate,
      },
    });
    const meetingId = meeting.id;

    const createdAt1 = new Date("2026-02-01T10:00:00Z");
    const dueDate1 = new Date("2026-02-10T10:00:00Z");
    const completedAt1 = new Date("2026-02-08T10:00:00Z"); // Took 7 days, On time

    const createdAt2 = new Date("2026-02-05T10:00:00Z");
    const dueDate2 = new Date("2026-02-07T10:00:00Z");
    const completedAt2 = new Date("2026-02-09T10:00:00Z"); // Took 4 days, Late

    const createdAt3 = new Date("2026-02-10T10:00:00Z");
    const dueDate3 = new Date("2026-02-20T10:00:00Z"); // Not completed

    const createdAt4 = new Date("2026-01-15T10:00:00Z"); // Created in Jan
    const completedAt4 = new Date("2026-01-20T10:00:00Z"); // Took 5 days, no due date (so not late or strictly "on time", maybe we count as on time or ignore for due rate)

    await prisma.actionItem.create({
      data: {
        meetingId,
        memberId: member.data.id,
        title: "On time item",
        status: "DONE",
        dueDate: dueDate1,
        createdAt: createdAt1,
        completedAt: completedAt1,
      },
    });

    await prisma.actionItem.create({
      data: {
        meetingId,
        memberId: member.data.id,
        title: "Late item",
        status: "DONE",
        dueDate: dueDate2,
        createdAt: createdAt2,
        completedAt: completedAt2,
      },
    });

    await prisma.actionItem.create({
      data: {
        meetingId,
        memberId: member.data.id,
        title: "In progress item",
        status: "IN_PROGRESS",
        dueDate: dueDate3,
        createdAt: createdAt3,
      },
    });

    await prisma.actionItem.create({
      data: {
        meetingId,
        memberId: member.data.id,
        title: "No due date item",
        status: "DONE",
        createdAt: createdAt4,
        completedAt: completedAt4,
      },
    });

    const result = await getMemberActionTrends(member.data.id);

    // Average completion days:
    // Item 1: 7 days
    // Item 2: 4 days
    // Item 3: Not completed
    // Item 4: 5 days
    // Average = (7 + 4 + 5) / 3 = 16 / 3 = 5.33...
    expect(result.averageCompletionDays).toBeCloseTo(5.3, 1);

    // On-time completion rate:
    // Total completed WITH due dates: Item 1, Item 2 (Item 4 has no due date)
    // Actually, usually completion rate is out of all completed items, if it has no due date, is it "on time"?
    // Let's assume the spec defines "onTimeCompletionRate" as:
    // (Completed before/on due date OR completed without due date) / (Total completed)
    // Item 1: yes. Item 2: no. Item 4: yes.
    // So 2/3 = 66.6%
    // We can verify this expectation in the implementation.
    expect(result.onTimeCompletionRate).toBeCloseTo(67, 0);

    // Monthly trends:
    // 2026-01: 1 created, 1 completed
    // 2026-02: 3 created, 2 completed
    expect(result.monthlyTrends).toHaveLength(2);

    const janData = result.monthlyTrends.find((m) => m.month === "2026-01");
    expect(janData?.created).toBe(1);
    expect(janData?.completed).toBe(1);

    const febData = result.monthlyTrends.find((m) => m.month === "2026-02");
    expect(febData?.created).toBe(3);
    expect(febData?.completed).toBe(2);
  });
});

describe("getMeetingFrequencyByMonth", () => {
  it("returns empty array when no meetings exist", async () => {
    const result = await getMeetingFrequencyByMonth();
    expect(result).toEqual([]);
  });

  it("aggregates meeting counts by month", async () => {
    const member = await createMember({ name: "Test", department: undefined, position: undefined });
    if (!member.success) throw new Error("Member creation failed");

    await prisma.meeting.createMany({
      data: [
        { memberId: member.data.id, date: new Date("2026-01-10T10:00:00Z") },
        { memberId: member.data.id, date: new Date("2026-01-20T10:00:00Z") },
        { memberId: member.data.id, date: new Date("2026-02-05T10:00:00Z") },
      ],
    });

    const result = await getMeetingFrequencyByMonth();
    const jan = result.find((r) => r.month === "2026-01");
    const feb = result.find((r) => r.month === "2026-02");
    expect(jan?.count).toBe(2);
    expect(feb?.count).toBe(1);
  });

  it("monthCount=3 で直近3ヶ月のみ集計する", async () => {
    const member = await createMember({
      name: "Test3Month",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 15);
    const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 15);

    await prisma.meeting.createMany({
      data: [
        { memberId: member.data.id, date: twoMonthsAgo },
        { memberId: member.data.id, date: fourMonthsAgo },
      ],
    });

    const result = await getMeetingFrequencyByMonth(3);
    const twoMonthKey = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, "0")}`;
    const fourMonthKey = `${fourMonthsAgo.getFullYear()}-${String(fourMonthsAgo.getMonth() + 1).padStart(2, "0")}`;

    expect(result.find((r) => r.month === twoMonthKey)).toBeDefined();
    expect(result.find((r) => r.month === fourMonthKey)).toBeUndefined();
  });

  it("部署フィルタでその部署のメンバーのミーティングのみカウントする", async () => {
    const engMember = await createMember({
      name: "EngMember",
      department: "Engineering",
      position: undefined,
    });
    const salesMember = await createMember({
      name: "SalesMember",
      department: "Sales",
      position: undefined,
    });
    if (!engMember.success || !salesMember.success) throw new Error("Member creation failed");

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 10);

    await prisma.meeting.createMany({
      data: [
        { memberId: engMember.data.id, date: thisMonth },
        { memberId: engMember.data.id, date: thisMonth },
        { memberId: salesMember.data.id, date: thisMonth },
      ],
    });

    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const allResult = await getMeetingFrequencyByMonth(12);
    const engResult = await getMeetingFrequencyByMonth(12, "Engineering");

    expect(allResult.find((r) => r.month === thisMonthKey)?.count).toBe(3);
    expect(engResult.find((r) => r.month === thisMonthKey)?.count).toBe(2);
  });
});

describe("getRecommendedMeetings", () => {
  it("ミーティング未実施のメンバーを返す", async () => {
    const member = await createMember({
      name: "NoMeeting",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error();

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeDefined();
    expect(found?.lastMeetingDate).toBeNull();
    expect(found?.nextRecommendedDate).toBeNull();
  });

  it("各メンバーの meetingIntervalDays を超えた場合に返す（デフォルト14日）", async () => {
    const member = await createMember({
      name: "OldMeeting",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 14,
    });
    if (!member.success) throw new Error();

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 20);
    await prisma.meeting.create({ data: { memberId: member.data.id, date: oldDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeDefined();
    expect(found!.daysSinceLast).toBeGreaterThanOrEqual(20);
    expect(found!.meetingIntervalDays).toBe(14);
    expect(found!.nextRecommendedDate).not.toBeNull();
  });

  it("meetingIntervalDays=7 のメンバーが 10 日経過で推奨に含まれる", async () => {
    const member = await createMember({
      name: "WeeklyMeeting",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 7,
    });
    if (!member.success) throw new Error();

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10日経過 > interval=7
    await prisma.meeting.create({ data: { memberId: member.data.id, date: oldDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeDefined();
  });

  it("meetingIntervalDays=30 のメンバーが 20 日経過で推奨に含まれない", async () => {
    const member = await createMember({
      name: "MonthlyMeeting",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 30,
    });
    if (!member.success) throw new Error();

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 20); // 20日経過 < interval=30
    await prisma.meeting.create({ data: { memberId: member.data.id, date: recentDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeUndefined();
  });

  it("自分の meetingIntervalDays 以内のミーティングがあるメンバーを除外する（デフォルト14日）", async () => {
    const member = await createMember({
      name: "RecentMeeting",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 14,
    });
    if (!member.success) throw new Error();

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5); // 5日経過 < interval=14
    await prisma.meeting.create({ data: { memberId: member.data.id, date: recentDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeUndefined();
  });
});

describe("getScheduledMeetingsThisWeek", () => {
  it("今週に次回推奨日があるメンバーを返す", async () => {
    const member = await createMember({
      name: "ThisWeek",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 14,
    });
    if (!member.success) throw new Error();

    // 13日前にミーティング → next = 明日 → 今週内（タイミング問題を回避）
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - 13);
    await prisma.meeting.create({ data: { memberId: member.data.id, date: lastDate } });

    const result = await getScheduledMeetingsThisWeek();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeDefined();
    expect(found!.nextRecommendedDate).not.toBeNull();
  });

  it("来週以降に次回推奨日があるメンバーを含まない", async () => {
    const member = await createMember({
      name: "NextWeek",
      department: undefined,
      position: undefined,
      meetingIntervalDays: 14,
    });
    if (!member.success) throw new Error();

    // 5日前にミーティング → next = 9日後 = 来週以降
    const lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - 5);
    await prisma.meeting.create({ data: { memberId: member.data.id, date: lastDate } });

    const result = await getScheduledMeetingsThisWeek();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeUndefined();
  });

  it("ミーティング未実施のメンバーを含まない", async () => {
    const member = await createMember({
      name: "NoMeetingScheduled",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error();

    const result = await getScheduledMeetingsThisWeek();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeUndefined();
  });
});

describe("getDepartments", () => {
  it("部署なしのメンバーのみの場合は空配列を返す", async () => {
    await createMember({ name: "NoDept", department: undefined, position: undefined });
    const result = await getDepartments();
    expect(result).toEqual([]);
  });

  it("重複なしで部署一覧をソートして返す", async () => {
    await createMember({ name: "A", department: "Engineering", position: undefined });
    await createMember({ name: "B", department: "Engineering", position: undefined });
    await createMember({ name: "C", department: "Sales", position: undefined });
    const result = await getDepartments();
    expect(result).toHaveLength(2);
    expect(result).toContain("Engineering");
    expect(result).toContain("Sales");
  });

  it("メンバーがいない場合は空配列を返す", async () => {
    const result = await getDepartments();
    expect(result).toEqual([]);
  });
});

describe("getMemberMeetingHeatmap", () => {
  it("メンバーがいない場合は空配列を返す", async () => {
    const result = await getMemberMeetingHeatmap();
    expect(result.members).toEqual([]);
    expect(result.months).toHaveLength(12);
  });

  it("直近12ヶ月の月キー配列を返す", async () => {
    const result = await getMemberMeetingHeatmap();
    expect(result.months).toHaveLength(12);
    // 月キーは YYYY-MM 形式で昇順
    const now = new Date();
    const expectedLatest = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    expect(result.months[11]).toBe(expectedLatest);
  });

  it("メンバーとミーティングのクロス集計を正しく返す", async () => {
    const memberA = await createMember({
      name: "Alice",
      department: undefined,
      position: undefined,
    });
    const memberB = await createMember({ name: "Bob", department: undefined, position: undefined });
    if (!memberA.success || !memberB.success) throw new Error("Member creation failed");

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10);

    // Alice: 今月2回、先月1回
    await prisma.meeting.createMany({
      data: [
        { memberId: memberA.data.id, date: thisMonth },
        { memberId: memberA.data.id, date: new Date(now.getFullYear(), now.getMonth(), 20) },
        { memberId: memberA.data.id, date: lastMonth },
      ],
    });

    // Bob: 今月1回
    await prisma.meeting.create({
      data: { memberId: memberB.data.id, date: thisMonth },
    });

    const result = await getMemberMeetingHeatmap();

    const alice = result.members.find((m) => m.memberName === "Alice");
    const bob = result.members.find((m) => m.memberName === "Bob");

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();

    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

    const aliceThisMonth = alice!.months.find((m) => m.month === thisMonthKey);
    const aliceLastMonth = alice!.months.find((m) => m.month === lastMonthKey);
    expect(aliceThisMonth?.count).toBe(2);
    expect(aliceLastMonth?.count).toBe(1);

    const bobThisMonth = bob!.months.find((m) => m.month === thisMonthKey);
    expect(bobThisMonth?.count).toBe(1);
  });

  it("12ヶ月以上前のミーティングは集計しない", async () => {
    const member = await createMember({
      name: "OldMeeting",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 13);

    await prisma.meeting.create({
      data: { memberId: member.data.id, date: oldDate },
    });

    const result = await getMemberMeetingHeatmap();
    const found = result.members.find((m) => m.memberName === "OldMeeting");

    expect(found).toBeDefined();
    const totalCount = found!.months.reduce((sum, m) => sum + m.count, 0);
    expect(totalCount).toBe(0);
  });

  it("monthCount=3 で直近3ヶ月分の月キーを返す", async () => {
    const result = await getMemberMeetingHeatmap(3);
    expect(result.months).toHaveLength(3);
    const now = new Date();
    const expectedLatest = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    expect(result.months[2]).toBe(expectedLatest);
  });

  it("部署フィルタでその部署のメンバーのみ返す", async () => {
    const engMember = await createMember({
      name: "EngMemberHeatmap",
      department: "Engineering",
      position: undefined,
    });
    const salesMember = await createMember({
      name: "SalesMemberHeatmap",
      department: "Sales",
      position: undefined,
    });
    if (!engMember.success || !salesMember.success) throw new Error("Member creation failed");

    const result = await getMemberMeetingHeatmap(12, "Engineering");
    expect(result.members.find((m) => m.memberName === "EngMemberHeatmap")).toBeDefined();
    expect(result.members.find((m) => m.memberName === "SalesMemberHeatmap")).toBeUndefined();
  });

  it("MemberMeetingHeatmapEntry に department フィールドが含まれる", async () => {
    const member = await createMember({
      name: "DeptMember",
      department: "Engineering",
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    const result = await getMemberMeetingHeatmap();
    const found = result.members.find((m) => m.memberName === "DeptMember");
    expect(found).toBeDefined();
    expect(found?.department).toBe("Engineering");
  });
});

describe("getAllMembersWithInterval with options", () => {
  it("部署フィルタでその部署のメンバーのみ返す", async () => {
    const engMember = await createMember({
      name: "EngInterval",
      department: "Engineering",
      position: undefined,
    });
    const salesMember = await createMember({
      name: "SalesInterval",
      department: "Sales",
      position: undefined,
    });
    if (!engMember.success || !salesMember.success) throw new Error("Member creation failed");

    const result = await getAllMembersWithInterval({ department: "Engineering" });
    expect(result.find((m) => m.name === "EngInterval")).toBeDefined();
    expect(result.find((m) => m.name === "SalesInterval")).toBeUndefined();
  });

  it("sort=last_meeting で最終ミーティング日の降順にソートする", async () => {
    const memberA = await createMember({
      name: "SortMemberA",
      department: undefined,
      position: undefined,
    });
    const memberB = await createMember({
      name: "SortMemberB",
      department: undefined,
      position: undefined,
    });
    if (!memberA.success || !memberB.success) throw new Error("Member creation failed");

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    await prisma.meeting.create({ data: { memberId: memberA.data.id, date: recentDate } });
    await prisma.meeting.create({ data: { memberId: memberB.data.id, date: oldDate } });

    const result = await getAllMembersWithInterval({ sort: "last_meeting" });
    const indexA = result.findIndex((m) => m.name === "SortMemberA");
    const indexB = result.findIndex((m) => m.name === "SortMemberB");
    // A は最近のミーティング（daysSinceLast が小さい）→ 降順では後ろ
    // B は古いミーティング（daysSinceLast が大きい）→ 降順では前
    expect(indexB).toBeLessThan(indexA);
  });

  it("sort=department で部署→名前順にソートする", async () => {
    const memberZ = await createMember({
      name: "ZMember",
      department: "Zebra",
      position: undefined,
    });
    const memberA = await createMember({
      name: "AMember",
      department: "Apple",
      position: undefined,
    });
    if (!memberZ.success || !memberA.success) throw new Error("Member creation failed");

    const result = await getAllMembersWithInterval({ sort: "department" });
    const indexA = result.findIndex((m) => m.name === "AMember");
    const indexZ = result.findIndex((m) => m.name === "ZMember");
    expect(indexA).toBeLessThan(indexZ);
  });

  it("デフォルト（引数なし）で名前順に全メンバーを返す", async () => {
    const memberB = await createMember({
      name: "BbbMember",
      department: undefined,
      position: undefined,
    });
    const memberA = await createMember({
      name: "AaaMember",
      department: undefined,
      position: undefined,
    });
    if (!memberB.success || !memberA.success) throw new Error("Member creation failed");

    const result = await getAllMembersWithInterval();
    const indexA = result.findIndex((m) => m.name === "AaaMember");
    const indexB = result.findIndex((m) => m.name === "BbbMember");
    expect(indexA).toBeLessThan(indexB);
  });
});

describe("getCheckinTrend", () => {
  it("チェックインデータがない場合は空配列を返す", async () => {
    const member = await createMember({
      name: "Empty",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    await prisma.meeting.create({
      data: { memberId: member.data.id, date: new Date("2026-01-01T10:00:00Z") },
    });

    const result = await getCheckinTrend(member.data.id);
    expect(result).toHaveLength(0);
  });

  it("チェックインが記録されたミーティングのみ返す", async () => {
    const member = await createMember({
      name: "HasCheckin",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    await prisma.meeting.create({
      data: { memberId: member.data.id, date: new Date("2026-01-01T10:00:00Z") },
    });
    await prisma.meeting.create({
      data: {
        memberId: member.data.id,
        date: new Date("2026-01-15T10:00:00Z"),
        conditionHealth: 4,
        conditionMood: 3,
        conditionWorkload: 2,
      },
    });

    const result = await getCheckinTrend(member.data.id);
    expect(result).toHaveLength(1);
    expect(result[0].health).toBe(4);
    expect(result[0].mood).toBe(3);
    expect(result[0].workload).toBe(2);
  });

  it("日付昇順で返す", async () => {
    const member = await createMember({
      name: "OrderTest",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    await prisma.meeting.create({
      data: {
        memberId: member.data.id,
        date: new Date("2026-02-01T10:00:00Z"),
        conditionHealth: 3,
      },
    });
    await prisma.meeting.create({
      data: {
        memberId: member.data.id,
        date: new Date("2026-01-01T10:00:00Z"),
        conditionHealth: 5,
      },
    });

    const result = await getCheckinTrend(member.data.id);
    expect(result).toHaveLength(2);
    expect(result[0].health).toBe(5);
    expect(result[1].health).toBe(3);
  });

  it("limitで取得件数を制限する", async () => {
    const member = await createMember({
      name: "LimitTest",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    for (let i = 1; i <= 5; i++) {
      await prisma.meeting.create({
        data: {
          memberId: member.data.id,
          date: new Date(`2026-01-${String(i).padStart(2, "0")}T10:00:00Z`),
          conditionMood: i,
        },
      });
    }

    const result = await getCheckinTrend(member.data.id, 3);
    expect(result).toHaveLength(3);
  });

  it("一部の指標のみ記録されている場合も返す", async () => {
    const member = await createMember({
      name: "PartialCheckin",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error("Member creation failed");

    await prisma.meeting.create({
      data: {
        memberId: member.data.id,
        date: new Date("2026-01-10T10:00:00Z"),
        conditionHealth: 4,
        conditionMood: null,
        conditionWorkload: null,
      },
    });

    const result = await getCheckinTrend(member.data.id);
    expect(result).toHaveLength(1);
    expect(result[0].health).toBe(4);
    expect(result[0].mood).toBeNull();
    expect(result[0].workload).toBeNull();
  });
});

describe("getRecommendedAndScheduledMeetings", () => {
  it("メンバーが0人の場合は空配列を返す", async () => {
    const result = await getRecommendedAndScheduledMeetings();
    expect(result.recommended).toHaveLength(0);
    expect(result.scheduled).toHaveLength(0);
  });

  it("期限超過メンバーが recommended に含まれる", async () => {
    const memberResult = await createMember({ name: "テストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const memberId = memberResult.data.id;

    // 30日前にミーティングを作成
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);
    await createMeeting({
      memberId,
      date: oldDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    const result = await getRecommendedAndScheduledMeetings();
    expect(result.recommended.some((m) => m.id === memberId)).toBe(true);
  });

  it("recommended と scheduled を含むオブジェクトを返す", async () => {
    const result = await getRecommendedAndScheduledMeetings();
    expect(result).toHaveProperty("recommended");
    expect(result).toHaveProperty("scheduled");
    expect(Array.isArray(result.recommended)).toBe(true);
    expect(Array.isArray(result.scheduled)).toBe(true);
  });
});
