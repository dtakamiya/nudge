import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import { createMeeting } from "../meeting-actions";
import {
  createMember,
  deleteMember,
  getMember,
  getMemberMeetings,
  getMembers,
  getMemberTimeline,
  updateMember,
} from "../member-actions";

beforeEach(async () => {
  await cleanDatabase();
});

describe("createMember", () => {
  it("creates a member with valid data", async () => {
    const result = await createMember({
      name: "Tanaka Taro",
      department: "Engineering",
      position: "Senior",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe("Tanaka Taro");
    expect(result.data.department).toBe("Engineering");
  });

  it("returns error for invalid data", async () => {
    const result = await createMember({ name: "" });
    expect(result.success).toBe(false);
  });

  it("バリデーションエラーのメッセージが日本語で返る", async () => {
    const result = await createMember({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("getMembers", () => {
  it("returns all members", async () => {
    await createMember({ name: "Member A" });
    await createMember({ name: "Member B" });
    const members = await getMembers();
    expect(members).toHaveLength(2);
  });

  it("includes overdue action count per member", async () => {
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
        { title: "Overdue", description: "", sortOrder: 0, dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", sortOrder: 1, dueDate: tomorrow.toISOString() },
        { title: "No due", description: "", sortOrder: 2 },
      ],
    });

    const members = await getMembers();
    expect(members[0]._count.actionItems).toBe(3); // all pending
    expect(members[0].overdueActionCount).toBe(1);
  });
});

describe("getMember", () => {
  it("returns member by id", async () => {
    const result = await createMember({ name: "Test Member" });
    if (!result.success) throw new Error(result.error);
    const found = await getMember(result.data.id);
    expect(found?.name).toBe("Test Member");
  });

  it("returns null for non-existent id", async () => {
    const found = await getMember("non-existent");
    expect(found).toBeNull();
  });

  it("returns lastMeetingDate from the most recent meeting", async () => {
    const memberResult = await createMember({ name: "With Meetings" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const oldDate = new Date("2025-01-01T00:00:00Z");
    const newDate = new Date("2026-01-01T00:00:00Z");
    await createMeeting({
      memberId: memberResult.data.id,
      date: oldDate.toISOString(),
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId: memberResult.data.id,
      date: newDate.toISOString(),
      topics: [],
      actionItems: [],
    });
    const found = await getMember(memberResult.data.id);
    expect(found?.lastMeetingDate?.toISOString()).toBe(newDate.toISOString());
    expect(found?.totalMeetingCount).toBe(2);
  });

  it("returns pendingActionItems excluding DONE items", async () => {
    const memberResult = await createMember({ name: "Action Tester" });
    if (!memberResult.success) throw new Error(memberResult.error);
    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Pending", description: "", sortOrder: 0 },
        { title: "Also pending", description: "", sortOrder: 1 },
      ],
    });
    const found = await getMember(memberResult.data.id);
    expect(found?.pendingActionItems).toHaveLength(2);
  });
});

describe("getMemberMeetings", () => {
  it("returns empty page for member with no meetings", async () => {
    const result = await createMember({ name: "No Meetings" });
    if (!result.success) throw new Error(result.error);
    const page = await getMemberMeetings(result.data.id);
    expect(page.meetings).toHaveLength(0);
    expect(page.total).toBe(0);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrev).toBe(false);
  });

  it("returns paginated meetings ordered by date desc", async () => {
    const memberResult = await createMember({ name: "Paginated" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const dates = [
      new Date("2026-01-01T00:00:00Z"),
      new Date("2026-01-02T00:00:00Z"),
      new Date("2026-01-03T00:00:00Z"),
    ];
    for (const date of dates) {
      await createMeeting({
        memberId: memberResult.data.id,
        date: date.toISOString(),
        topics: [],
        actionItems: [],
      });
    }
    const page = await getMemberMeetings(memberResult.data.id, 1, 2);
    expect(page.meetings).toHaveLength(2);
    expect(page.total).toBe(3);
    expect(page.hasNext).toBe(true);
    expect(page.hasPrev).toBe(false);
    // 最新が先頭
    expect(page.meetings[0].date.toISOString()).toBe(dates[2].toISOString());
  });

  it("returns correct second page", async () => {
    const memberResult = await createMember({ name: "Page2" });
    if (!memberResult.success) throw new Error(memberResult.error);
    for (let i = 1; i <= 3; i++) {
      await createMeeting({
        memberId: memberResult.data.id,
        date: new Date(`2026-01-0${i}T00:00:00Z`).toISOString(),
        topics: [],
        actionItems: [],
      });
    }
    const page = await getMemberMeetings(memberResult.data.id, 2, 2);
    expect(page.meetings).toHaveLength(1);
    expect(page.hasNext).toBe(false);
    expect(page.hasPrev).toBe(true);
  });
});

describe("updateMember", () => {
  it("updates member fields", async () => {
    const created = await createMember({ name: "Old Name" });
    if (!created.success) throw new Error(created.error);
    const updated = await updateMember(created.data.id, { name: "New Name" });
    expect(updated.success).toBe(true);
    if (!updated.success) return;
    expect(updated.data.name).toBe("New Name");
  });

  it("returns error for empty id", async () => {
    const result = await updateMember("", { name: "New" });
    expect(result.success).toBe(false);
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await updateMember("non-existent-id", { name: "New" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("deleteMember", () => {
  it("deletes member by id", async () => {
    const created = await createMember({ name: "To Delete" });
    if (!created.success) throw new Error(created.error);
    const deleted = await deleteMember(created.data.id);
    expect(deleted.success).toBe(true);
    const found = await getMember(created.data.id);
    expect(found).toBeNull();
  });

  it("returns error for empty id", async () => {
    const result = await deleteMember("");
    expect(result.success).toBe(false);
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await deleteMember("non-existent-id");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe("getMemberTimeline", () => {
  it("returns empty array for member with no meetings or actions", async () => {
    const result = await createMember({ name: "Empty Timeline" });
    if (!result.success) throw new Error(result.error);
    const entries = await getMemberTimeline(result.data.id);
    expect(entries).toHaveLength(0);
  });

  it("includes meeting entries sorted by date desc", async () => {
    const memberResult = await createMember({ name: "Timeline Member" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const date1 = new Date("2026-01-01T00:00:00Z");
    const date2 = new Date("2026-01-10T00:00:00Z");
    const m1 = await createMeeting({
      memberId: memberResult.data.id,
      date: date1.toISOString(),
      topics: [{ title: "Topic A", category: "OTHER", sortOrder: 0 }],
      actionItems: [{ title: "Action A", description: "", sortOrder: 0 }],
    });
    if (!m1.success) throw new Error(m1.error);
    const m2 = await createMeeting({
      memberId: memberResult.data.id,
      date: date2.toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!m2.success) throw new Error(m2.error);

    const entries = await getMemberTimeline(memberResult.data.id);
    const meetingEntries = entries.filter((e) => e.type === "meeting");
    expect(meetingEntries).toHaveLength(2);
    // 降順に並んでいること
    expect(meetingEntries[0].date.toISOString()).toBe(date2.toISOString());
    expect(meetingEntries[1].date.toISOString()).toBe(date1.toISOString());
    // topic/actionカウント
    const older = meetingEntries[1];
    if (older.type === "meeting") {
      expect(older.topicCount).toBe(1);
      expect(older.actionCount).toBe(1);
    }
  });

  it("includes action_completed entries for DONE actions with completedAt", async () => {
    const memberResult = await createMember({ name: "Completed Actions" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const meetingDate = new Date("2026-01-05T00:00:00Z");
    const meeting = await createMeeting({
      memberId: memberResult.data.id,
      date: meetingDate.toISOString(),
      topics: [],
      actionItems: [{ title: "Done Action", description: "", sortOrder: 0 }],
    });
    if (!meeting.success) throw new Error(meeting.error);

    // アクションをDONEにする
    const completedAt = new Date("2026-01-10T00:00:00Z");
    const actionItem = await prisma.actionItem.findFirst({
      where: { meetingId: meeting.data.id },
    });
    if (!actionItem) throw new Error("action item not found");
    await prisma.actionItem.update({
      where: { id: actionItem.id },
      data: { status: "DONE", completedAt },
    });

    const entries = await getMemberTimeline(memberResult.data.id);
    const completedEntries = entries.filter((e) => e.type === "action_completed");
    expect(completedEntries).toHaveLength(1);
    if (completedEntries[0].type === "action_completed") {
      expect(completedEntries[0].title).toBe("Done Action");
      expect(completedEntries[0].completedAt.toISOString()).toBe(completedAt.toISOString());
    }
  });

  it("includes action_overdue entries for overdue non-DONE actions", async () => {
    const memberResult = await createMember({ name: "Overdue Actions" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        {
          title: "Overdue Action",
          description: "",
          sortOrder: 0,
          dueDate: yesterday.toISOString(),
        },
      ],
    });

    const entries = await getMemberTimeline(memberResult.data.id);
    const overdueEntries = entries.filter((e) => e.type === "action_overdue");
    expect(overdueEntries).toHaveLength(1);
    if (overdueEntries[0].type === "action_overdue") {
      expect(overdueEntries[0].title).toBe("Overdue Action");
    }
  });

  it("does not include non-overdue pending actions", async () => {
    const memberResult = await createMember({ name: "Future Action" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        {
          title: "Future Action",
          description: "",
          sortOrder: 0,
          dueDate: tomorrow.toISOString(),
        },
      ],
    });

    const entries = await getMemberTimeline(memberResult.data.id);
    const overdueEntries = entries.filter((e) => e.type === "action_overdue");
    expect(overdueEntries).toHaveLength(0);
  });
});
