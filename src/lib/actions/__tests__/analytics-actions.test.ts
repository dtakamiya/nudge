import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getMemberActionTrends,
  getMeetingFrequencyByMonth,
  getRecommendedMeetings,
  getMemberMeetingHeatmap,
} from "../analytics-actions";
import { createMember } from "../member-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
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
});

describe("getRecommendedMeetings", () => {
  it("returns members with no meetings", async () => {
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
  });

  it("returns members whose last meeting was over 14 days ago", async () => {
    const member = await createMember({
      name: "OldMeeting",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error();

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 20);
    await prisma.meeting.create({ data: { memberId: member.data.id, date: oldDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeDefined();
    expect(found!.daysSinceLast).toBeGreaterThanOrEqual(20);
  });

  it("excludes members with recent meetings (within 14 days)", async () => {
    const member = await createMember({
      name: "RecentMeeting",
      department: undefined,
      position: undefined,
    });
    if (!member.success) throw new Error();

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5);
    await prisma.meeting.create({ data: { memberId: member.data.id, date: recentDate } });

    const result = await getRecommendedMeetings();
    const found = result.find((r) => r.id === member.data.id);
    expect(found).toBeUndefined();
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
});
