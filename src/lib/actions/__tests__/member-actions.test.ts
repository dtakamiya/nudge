import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import { createMeeting } from "../meeting-actions";
import {
  createMember,
  deleteMember,
  getMember,
  getMemberMeetings,
  getMembers,
  updateMember,
} from "../member-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
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
});
