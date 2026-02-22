import { describe, expect, it } from "vitest";

import { createMeetingSchema, updateMeetingSchema } from "../meeting";

describe("createMeetingSchema", () => {
  it("accepts valid input with topics and actions", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "Sprint progress",
          notes: "On track",
          sortOrder: 0,
        },
      ],
      actionItems: [
        {
          title: "Review PR",
          description: "",
          dueDate: "2026-02-25",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("requires memberId", () => {
    const result = createMeetingSchema.safeParse({
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires date", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates topic category enum", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [
        {
          category: "INVALID",
          title: "Test",
          notes: "",
          sortOrder: 0,
        },
      ],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts actionItems with sortOrder", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [
        { title: "First", description: "", sortOrder: 0 },
        { title: "Second", description: "", sortOrder: 1 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.actionItems[0].sortOrder).toBe(0);
      expect(result.data.actionItems[1].sortOrder).toBe(1);
    }
  });

  it("defaults actionItem sortOrder to 0 when omitted", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [{ title: "Action", description: "" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.actionItems[0].sortOrder).toBe(0);
    }
  });

  it("allows empty topics and actions", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateMeetingSchema", () => {
  const validInput = {
    meetingId: "meeting-uuid",
    date: "2026-02-20T10:00:00.000Z",
    topics: [
      {
        id: "topic-uuid",
        category: "WORK_PROGRESS" as const,
        title: "Sprint progress",
        notes: "On track",
        sortOrder: 0,
      },
    ],
    actionItems: [
      {
        id: "action-uuid",
        title: "Review PR",
        description: "",
        dueDate: "2026-02-25",
      },
    ],
    deletedTopicIds: [],
    deletedActionItemIds: [],
  };

  it("accepts valid input with existing topics and action items", () => {
    const result = updateMeetingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("requires meetingId", () => {
    const { meetingId: _, ...withoutId } = validInput;
    const result = updateMeetingSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("requires date", () => {
    const { date: _, ...withoutDate } = validInput;
    const result = updateMeetingSchema.safeParse(withoutDate);
    expect(result.success).toBe(false);
  });

  it("accepts existing topic update with id", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      topics: [
        {
          id: "existing-topic-id",
          category: "CAREER",
          title: "Updated title",
          notes: "Updated notes",
          sortOrder: 0,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts new topic without id", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      topics: [
        {
          category: "ISSUES",
          title: "New topic",
          notes: "",
          sortOrder: 0,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts existing action item update with id", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      actionItems: [
        {
          id: "existing-action-id",
          title: "Updated action",
          description: "Details",
          dueDate: "2026-03-01",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts new action item without id", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      actionItems: [
        {
          title: "New action",
          description: "",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts deletedTopicIds and deletedActionItemIds", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      deletedTopicIds: ["topic-to-delete-1", "topic-to-delete-2"],
      deletedActionItemIds: ["action-to-delete-1"],
    });
    expect(result.success).toBe(true);
  });

  it("defaults deletedTopicIds and deletedActionItemIds to empty arrays", () => {
    const { deletedTopicIds: _, deletedActionItemIds: __, ...withoutDeleted } = validInput;
    const result = updateMeetingSchema.safeParse(withoutDeleted);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.deletedTopicIds).toEqual([]);
      expect(result.data.deletedActionItemIds).toEqual([]);
    }
  });

  it("validates topic category enum", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      topics: [
        {
          category: "INVALID_CATEGORY",
          title: "Test",
          notes: "",
          sortOrder: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty meetingId", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      meetingId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects topic with empty title", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "",
          notes: "",
          sortOrder: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects action item with empty title", () => {
    const result = updateMeetingSchema.safeParse({
      ...validInput,
      actionItems: [
        {
          title: "",
          description: "",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
