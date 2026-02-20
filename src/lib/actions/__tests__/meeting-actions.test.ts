import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { createMeeting, getMeeting, getPreviousMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await createMember({ name: "Test Member" });
  memberId = member.id;
});

describe("createMeeting", () => {
  it("creates meeting with topics and action items", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "WORK_PROGRESS", title: "Sprint review", notes: "Good progress", sortOrder: 0 }],
      actionItems: [{ title: "Fix bug #123", description: "Critical bug", dueDate: "2026-03-01" }],
    });
    expect(result.id).toBeDefined();
    expect(result.topics).toHaveLength(1);
    expect(result.actionItems).toHaveLength(1);
    expect(result.actionItems[0].memberId).toBe(memberId);
  });
});

describe("getMeeting", () => {
  it("returns meeting with topics and actions", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "CAREER", title: "Growth plan", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    const found = await getMeeting(created.id);
    expect(found?.topics).toHaveLength(1);
    expect(found?.topics[0].category).toBe("CAREER");
  });
});

describe("getPreviousMeeting", () => {
  it("returns the most recent meeting for a member", async () => {
    await createMeeting({
      memberId, date: "2026-01-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "Old topic", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId, date: "2026-02-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "Recent topic", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    const previous = await getPreviousMeeting(memberId);
    expect(previous?.topics[0].title).toBe("Recent topic");
  });
  it("returns null when no meetings exist", async () => {
    const previous = await getPreviousMeeting(memberId);
    expect(previous).toBeNull();
  });
});
