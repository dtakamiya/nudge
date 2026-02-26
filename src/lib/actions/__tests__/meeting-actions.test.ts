import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import {
  createMeeting,
  deleteMeeting,
  endMeeting,
  getAdjacentMeetings,
  getMeeting,
  getPreviousMeeting,
  getRecentMeetings,
  startMeeting,
  updateMeeting,
  updateTopicNotes,
} from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;

beforeEach(async () => {
  await cleanDatabase();
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

describe("getRecentMeetings", () => {
  it("returns meetings in descending date order", async () => {
    await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "1月の話題", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "2月の話題", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-03-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "3月の話題", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    const meetings = await getRecentMeetings(memberId);
    expect(meetings).toHaveLength(3);
    expect(meetings[0].topics[0].title).toBe("3月の話題");
    expect(meetings[1].topics[0].title).toBe("2月の話題");
    expect(meetings[2].topics[0].title).toBe("1月の話題");
  });

  it("respects the limit parameter", async () => {
    for (let i = 1; i <= 6; i++) {
      await createMeeting({
        memberId,
        date: `2026-0${Math.min(i, 9)}-01T10:00:00.000Z`,
        topics: [],
        actionItems: [],
      });
    }
    const meetings = await getRecentMeetings(memberId, 3);
    expect(meetings).toHaveLength(3);
  });

  it("returns empty array when no meetings exist", async () => {
    const meetings = await getRecentMeetings(memberId);
    expect(meetings).toHaveLength(0);
  });

  it("includes topics and actionItems", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "CAREER", title: "キャリア相談", notes: "メモ", sortOrder: 0 }],
      actionItems: [{ title: "タスク1", description: "", sortOrder: 0 }],
    });
    const meetings = await getRecentMeetings(memberId, 1);
    expect(meetings[0].topics).toHaveLength(1);
    expect(meetings[0].topics[0].title).toBe("キャリア相談");
    expect(meetings[0].actionItems).toHaveLength(1);
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

describe("createMeeting - チェックインコンディション", () => {
  it("コンディションフィールドを保存できる", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
      conditionHealth: 4,
      conditionMood: 3,
      conditionWorkload: 2,
      checkinNote: "体調は良好です",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const meeting = await getMeeting(result.data.id);
    expect(meeting?.conditionHealth).toBe(4);
    expect(meeting?.conditionMood).toBe(3);
    expect(meeting?.conditionWorkload).toBe(2);
    expect(meeting?.checkinNote).toBe("体調は良好です");
  });

  it("コンディションフィールドを省略してもデフォルト値で作成される", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const meeting = await getMeeting(result.data.id);
    expect(meeting?.conditionHealth).toBeNull();
    expect(meeting?.conditionMood).toBeNull();
    expect(meeting?.conditionWorkload).toBeNull();
    expect(meeting?.checkinNote).toBe("");
  });

  it("コンディションを null で保存できる", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
      conditionHealth: null,
      conditionMood: null,
      conditionWorkload: null,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const meeting = await getMeeting(result.data.id);
    expect(meeting?.conditionHealth).toBeNull();
    expect(meeting?.conditionMood).toBeNull();
    expect(meeting?.conditionWorkload).toBeNull();
  });
});

describe("updateMeeting - チェックインコンディション", () => {
  async function createTestMeetingWithCondition() {
    const result = await createMeeting({
      memberId,
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [],
      conditionHealth: 3,
      conditionMood: 3,
      conditionWorkload: 3,
      checkinNote: "初期ノート",
    });
    if (!result.success) throw new Error(result.error);
    return result.data;
  }

  it("コンディションフィールドを更新できる", async () => {
    const meeting = await createTestMeetingWithCondition();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
      conditionHealth: 5,
      conditionMood: 4,
      conditionWorkload: 2,
      checkinNote: "更新後のノート",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const updated = await getMeeting(meeting.id);
    expect(updated?.conditionHealth).toBe(5);
    expect(updated?.conditionMood).toBe(4);
    expect(updated?.conditionWorkload).toBe(2);
    expect(updated?.checkinNote).toBe("更新後のノート");
  });

  it("コンディションを null にリセットできる", async () => {
    const meeting = await createTestMeetingWithCondition();
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
      conditionHealth: null,
      conditionMood: null,
      conditionWorkload: null,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const updated = await getMeeting(meeting.id);
    expect(updated?.conditionHealth).toBeNull();
    expect(updated?.conditionMood).toBeNull();
    expect(updated?.conditionWorkload).toBeNull();
  });
});

describe("startMeeting", () => {
  it("startedAt に現在時刻がセットされること", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const before = new Date();
    const result = await startMeeting({ meetingId: created.data.id });
    const after = new Date();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.startedAt).not.toBeNull();
    expect(result.data.startedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(result.data.startedAt!.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  it("既に startedAt がセットされている場合は上書きしないこと（冪等性）", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const first = await startMeeting({ meetingId: created.data.id });
    expect(first.success).toBe(true);
    if (!first.success) return;
    const originalStartedAt = first.data.startedAt;

    // 少し待ってから再度呼ぶ
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await startMeeting({ meetingId: created.data.id });
    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.data.startedAt?.getTime()).toBe(originalStartedAt?.getTime());
  });

  it("存在しない meetingId でエラーを返すこと", async () => {
    const result = await startMeeting({ meetingId: "non-existent-id" });
    expect(result.success).toBe(false);
  });
});

describe("endMeeting", () => {
  it("endedAt に現在時刻がセットされること", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    await startMeeting({ meetingId: created.data.id });
    const before = new Date();
    const result = await endMeeting({ meetingId: created.data.id });
    const after = new Date();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.endedAt).not.toBeNull();
    expect(result.data.endedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(result.data.endedAt!.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  it("存在しない meetingId でエラーを返すこと", async () => {
    const result = await endMeeting({ meetingId: "non-existent-id" });
    expect(result.success).toBe(false);
  });

  it("既に endedAt がセットされている場合は上書きしないこと（冪等性）", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    await startMeeting({ meetingId: created.data.id });
    const first = await endMeeting({ meetingId: created.data.id });
    expect(first.success).toBe(true);
    if (!first.success) return;
    const originalEndedAt = first.data.endedAt;

    // 少し待ってから再度呼ぶ
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await endMeeting({ meetingId: created.data.id });
    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.data.endedAt?.getTime()).toBe(originalEndedAt?.getTime());
  });

  it("startedAt が未設定の場合はエラーを返すこと", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    // startMeeting を呼ばずに endMeeting を呼ぶ
    const result = await endMeeting({ meetingId: created.data.id });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBe("ミーティングがまだ開始されていません");
  });
});

describe("updateTopicNotes", () => {
  it("notes フィールドが更新されること", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "WORK_PROGRESS", title: "テストトピック", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const topicId = created.data.topics[0].id;
    const result = await updateTopicNotes({ topicId, notes: "更新されたノート" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.notes).toBe("更新されたノート");
  });

  it("空文字列でも保存できること", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [
        { category: "CAREER", title: "キャリアトピック", notes: "既存のノート", sortOrder: 0 },
      ],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const topicId = created.data.topics[0].id;
    const result = await updateTopicNotes({ topicId, notes: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.notes).toBe("");
  });

  it("存在しない topicId でエラーを返すこと", async () => {
    const result = await updateTopicNotes({ topicId: "non-existent-id", notes: "ノート" });
    expect(result.success).toBe(false);
  });
});

describe("getAdjacentMeetings", () => {
  async function createTestMeetings() {
    const r1 = await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      topics: [],
      actionItems: [],
      mood: 3,
    });
    if (!r1.success) throw new Error(r1.error);
    const r2 = await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
      topics: [],
      actionItems: [],
      mood: 4,
    });
    if (!r2.success) throw new Error(r2.error);
    const r3 = await createMeeting({
      memberId,
      date: "2026-03-01T10:00:00.000Z",
      topics: [],
      actionItems: [],
      mood: 5,
    });
    if (!r3.success) throw new Error(r3.error);
    return { first: r1.data, second: r2.data, third: r3.data };
  }

  it("前後両方が存在する場合: previous と next を返す", async () => {
    const { first, second, third } = await createTestMeetings();
    const result = await getAdjacentMeetings(memberId, second.id);
    expect(result.previous?.id).toBe(first.id);
    expect(result.next?.id).toBe(third.id);
  });

  it("前のみ存在する場合: previous を返し next は null", async () => {
    const { second, third } = await createTestMeetings();
    const result = await getAdjacentMeetings(memberId, third.id);
    expect(result.previous?.id).toBe(second.id);
    expect(result.next).toBeNull();
  });

  it("次のみ存在する場合: next を返し previous は null", async () => {
    const { first, second } = await createTestMeetings();
    const result = await getAdjacentMeetings(memberId, first.id);
    expect(result.previous).toBeNull();
    expect(result.next?.id).toBe(second.id);
  });

  it("ミーティングが1件のみの場合: 両方 null", async () => {
    const r = await createMeeting({
      memberId,
      date: "2026-06-01T10:00:00.000Z",
      topics: [],
      actionItems: [],
    });
    if (!r.success) throw new Error(r.error);
    const result = await getAdjacentMeetings(memberId, r.data.id);
    expect(result.previous).toBeNull();
    expect(result.next).toBeNull();
  });

  it("存在しない meetingId の場合: 両方 null", async () => {
    const result = await getAdjacentMeetings(memberId, "non-existent-id");
    expect(result.previous).toBeNull();
    expect(result.next).toBeNull();
  });

  it("mood フィールドが含まれること", async () => {
    const { first, second } = await createTestMeetings();
    const result = await getAdjacentMeetings(memberId, second.id);
    expect(result.previous?.mood).toBe(first.mood);
  });
});

describe("deleteMeeting", () => {
  it("ミーティングを削除できる", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const result = await deleteMeeting(created.data.id);
    expect(result.success).toBe(true);
    const deleted = await getMeeting(created.data.id);
    expect(deleted).toBeNull();
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await deleteMeeting("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("ミーティングIDが指定されていません");
    }
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await deleteMeeting("non-existent-id");
    expect(result.success).toBe(false);
  });
});

describe("updateMeeting - タグ付き新規アクションアイテム", () => {
  it("新規トピックにタグを付けて追加できる", async () => {
    const tag = await prisma.tag.create({ data: { name: "トピックタグ" } });
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const meeting = created.data;
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "タグ付きトピック",
          notes: "",
          sortOrder: 0,
          tagIds: [tag.id],
        },
      ],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const topicTags = await prisma.topicTag.findMany({
      where: { topicId: result.data.topics[0].id },
    });
    expect(topicTags).toHaveLength(1);
    expect(topicTags[0].tagId).toBe(tag.id);
  });

  it("既存アクションアイテムにタグを付けて更新できる", async () => {
    const tag = await prisma.tag.create({ data: { name: "更新タグ" } });
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "既存アクション", description: "", sortOrder: 0 }],
    });
    if (!created.success) throw new Error(created.error);
    const meeting = created.data;
    const actionId = meeting.actionItems[0].id;
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [],
      actionItems: [
        {
          id: actionId,
          title: "既存アクション",
          description: "",
          sortOrder: 0,
          tagIds: [tag.id],
        },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    const tags = await prisma.actionItemTag.findMany({
      where: { actionItemId: actionId },
    });
    expect(tags).toHaveLength(1);
    expect(tags[0].tagId).toBe(tag.id);
  });

  it("新規アクションアイテムにタグを付けて追加できる", async () => {
    const tag = await prisma.tag.create({ data: { name: "テストタグ" } });
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);
    const meeting = created.data;
    const result = await updateMeeting({
      meetingId: meeting.id,
      date: meeting.date.toISOString(),
      topics: [],
      actionItems: [
        {
          title: "タグ付きアクション",
          description: "",
          sortOrder: 0,
          tagIds: [tag.id],
        },
      ],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const updated = await getMeeting(meeting.id);
    expect(updated?.actionItems[0].title).toBe("タグ付きアクション");
    const tags = await prisma.actionItemTag.findMany({
      where: { actionItemId: updated!.actionItems[0].id },
    });
    expect(tags).toHaveLength(1);
    expect(tags[0].tagId).toBe(tag.id);
  });
});
