import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { createMeeting, getMeeting, getPreviousMeeting, updateMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const result = await createMember({ name: "Test Member" });
  if (!result.success) throw new Error(result.error);
  memberId = result.data.id;
});

describe("createMeeting", () => {
  it("creates meeting with topics and action items", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [
        { category: "WORK_PROGRESS", title: "Sprint review", notes: "Good progress", sortOrder: 0 },
      ],
      actionItems: [
        { title: "Fix bug #123", description: "Critical bug", sortOrder: 0, dueDate: "2026-03-01" },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();
    expect(result.data.topics).toHaveLength(1);
    expect(result.data.actionItems).toHaveLength(1);
    expect(result.data.actionItems[0].memberId).toBe(memberId);
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
    if (!created.success) throw new Error(created.error);
    const found = await getMeeting(created.data.id);
    expect(found?.topics).toHaveLength(1);
    expect(found?.topics[0].category).toBe("CAREER");
  });
});

describe("getPreviousMeeting", () => {
  it("returns the most recent meeting for a member", async () => {
    await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "Old topic", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
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

describe("updateMeeting", () => {
  async function createTestMeeting() {
    const result = await createMeeting({
      memberId,
      date: "2026-02-20T10:00:00.000Z",
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "Original topic",
          notes: "Original notes",
          sortOrder: 0,
        },
        { category: "CAREER", title: "Career topic", notes: "", sortOrder: 1 },
      ],
      actionItems: [
        {
          title: "Original action",
          description: "Original desc",
          sortOrder: 0,
          dueDate: "2026-03-01",
        },
      ],
    });
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  it("updates meeting date", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: "2026-03-15T10:00:00.000Z",
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: meeting.actionItems.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sortOrder: a.sortOrder,
        dueDate: a.dueDate?.toISOString().split("T")[0],
      })),
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.date.toISOString()).toBe("2026-03-15T10:00:00.000Z");
  });

  it("updates existing topic content", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [
        {
          id: meeting.topics[0].id,
          category: "ISSUES",
          title: "Updated topic title",
          notes: "Updated notes",
          sortOrder: 0,
        },
        {
          id: meeting.topics[1].id,
          category: meeting.topics[1].category as "CAREER",
          title: meeting.topics[1].title,
          notes: meeting.topics[1].notes,
          sortOrder: 1,
        },
      ],
      actionItems: meeting.actionItems.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sortOrder: a.sortOrder,
      })),
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics[0].title).toBe("Updated topic title");
    expect(result.data.topics[0].category).toBe("ISSUES");
    expect(result.data.topics[0].notes).toBe("Updated notes");
  });

  it("adds a new topic", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [
        ...meeting.topics.map((t) => ({
          id: t.id,
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        { category: "FEEDBACK" as const, title: "New topic", notes: "New notes", sortOrder: 2 },
      ],
      actionItems: meeting.actionItems.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sortOrder: a.sortOrder,
      })),
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics).toHaveLength(3);
    expect(result.data.topics[2].title).toBe("New topic");
  });

  it("deletes an existing topic", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [
        {
          id: meeting.topics[0].id,
          category: meeting.topics[0].category as "WORK_PROGRESS",
          title: meeting.topics[0].title,
          notes: meeting.topics[0].notes,
          sortOrder: 0,
        },
      ],
      actionItems: meeting.actionItems.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sortOrder: a.sortOrder,
      })),
      deletedTopicIds: [meeting.topics[1].id],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics).toHaveLength(1);
  });

  it("updates existing action item content", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [
        {
          id: meeting.actionItems[0].id,
          title: "Updated action",
          description: "Updated desc",
          sortOrder: meeting.actionItems[0].sortOrder,
          dueDate: "2026-04-01",
        },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems[0].title).toBe("Updated action");
    expect(result.data.actionItems[0].description).toBe("Updated desc");
  });

  it("adds a new action item", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [
        ...meeting.actionItems.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          sortOrder: a.sortOrder,
        })),
        { title: "New action", description: "New desc", sortOrder: 1, dueDate: "2026-05-01" },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems).toHaveLength(2);
    const newAction = result.data.actionItems.find((a) => a.title === "New action");
    expect(newAction).toBeDefined();
    expect(newAction?.memberId).toBe(memberId);
  });

  it("deletes an existing action item", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [meeting.actionItems[0].id],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems).toHaveLength(0);
  });

  it("updates topic sortOrder correctly", async () => {
    const meeting = await createTestMeeting();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [
        {
          id: meeting.topics[1].id,
          category: meeting.topics[1].category as "CAREER",
          title: meeting.topics[1].title,
          notes: meeting.topics[1].notes,
          sortOrder: 0,
        },
        {
          id: meeting.topics[0].id,
          category: meeting.topics[0].category as "WORK_PROGRESS",
          title: meeting.topics[0].title,
          notes: meeting.topics[0].notes,
          sortOrder: 1,
        },
      ],
      actionItems: meeting.actionItems.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        sortOrder: a.sortOrder,
      })),
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics[0].title).toBe("Career topic");
    expect(result.data.topics[1].title).toBe("Original topic");
  });

  it("returns error for non-existent meetingId", async () => {
    const result = await updateMeeting({
      meetingId: "non-existent-id",
      date: "2026-03-15T10:00:00.000Z",
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("returns error for invalid input", async () => {
    const result = await updateMeeting({
      meetingId: "",
      date: "",
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("saves sortOrder when creating action items", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "WORK_PROGRESS", title: "Topic", notes: "", sortOrder: 0 }],
      actionItems: [
        { title: "First action", description: "", sortOrder: 0 },
        { title: "Second action", description: "", sortOrder: 1 },
        { title: "Third action", description: "", sortOrder: 2 },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const meeting = await getMeeting(result.data.id);
    expect(meeting?.actionItems[0].title).toBe("First action");
    expect(meeting?.actionItems[0].sortOrder).toBe(0);
    expect(meeting?.actionItems[1].title).toBe("Second action");
    expect(meeting?.actionItems[1].sortOrder).toBe(1);
    expect(meeting?.actionItems[2].title).toBe("Third action");
    expect(meeting?.actionItems[2].sortOrder).toBe(2);
  });

  it("updates actionItem sortOrder when reordering", async () => {
    const meeting = await createTestMeeting();
    const actionId = meeting.actionItems[0].id;
    // Add a second action item via update
    const withTwo = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [
        { id: actionId, title: "First action", description: "", sortOrder: 0 },
        { title: "Second action", description: "", sortOrder: 1 },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    if (!withTwo.success) throw new Error(withTwo.error);

    // Reorder: swap first and second
    const secondId = withTwo.data.actionItems.find((a) => a.title === "Second action")!.id;
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [
        { id: secondId, title: "Second action", description: "", sortOrder: 0 },
        { id: actionId, title: "First action", description: "", sortOrder: 1 },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems[0].title).toBe("Second action");
    expect(result.data.actionItems[0].sortOrder).toBe(0);
    expect(result.data.actionItems[1].title).toBe("First action");
    expect(result.data.actionItems[1].sortOrder).toBe(1);
  });

  it("does not change action item status", async () => {
    const meeting = await createTestMeeting();
    // Change status via direct update
    await prisma.actionItem.update({
      where: { id: meeting.actionItems[0].id },
      data: { status: "IN_PROGRESS" },
    });
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: meeting.topics.map((t) => ({
        id: t.id,
        category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
        title: t.title,
        notes: t.notes,
        sortOrder: t.sortOrder,
      })),
      actionItems: [
        {
          id: meeting.actionItems[0].id,
          title: "Updated title only",
          description: meeting.actionItems[0].description,
          sortOrder: meeting.actionItems[0].sortOrder,
        },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems[0].status).toBe("IN_PROGRESS");
    expect(result.data.actionItems[0].title).toBe("Updated title only");
  });
});
