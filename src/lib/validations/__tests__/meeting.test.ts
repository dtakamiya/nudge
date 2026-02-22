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

describe("createMeetingSchema - conditionフィールド", () => {
  const baseInput = {
    memberId: "some-uuid",
    date: "2026-02-20T10:00:00.000Z",
    topics: [],
    actionItems: [],
  };

  it("conditionHealth が 1-5 の範囲で有効", () => {
    for (const val of [1, 2, 3, 4, 5]) {
      const result = createMeetingSchema.safeParse({ ...baseInput, conditionHealth: val });
      expect(result.success).toBe(true);
    }
  });

  it("conditionHealth が 0 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionHealth: 0 });
    expect(result.success).toBe(false);
  });

  it("conditionHealth が 6 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionHealth: 6 });
    expect(result.success).toBe(false);
  });

  it("conditionHealth が null は有効", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionHealth: null });
    expect(result.success).toBe(true);
  });

  it("conditionHealth が undefined（省略）は有効", () => {
    const result = createMeetingSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("conditionMood が 1-5 の範囲で有効", () => {
    for (const val of [1, 2, 3, 4, 5]) {
      const result = createMeetingSchema.safeParse({ ...baseInput, conditionMood: val });
      expect(result.success).toBe(true);
    }
  });

  it("conditionMood が 0 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionMood: 0 });
    expect(result.success).toBe(false);
  });

  it("conditionMood が 6 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionMood: 6 });
    expect(result.success).toBe(false);
  });

  it("conditionMood が null は有効", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionMood: null });
    expect(result.success).toBe(true);
  });

  it("conditionWorkload が 1-5 の範囲で有効", () => {
    for (const val of [1, 2, 3, 4, 5]) {
      const result = createMeetingSchema.safeParse({ ...baseInput, conditionWorkload: val });
      expect(result.success).toBe(true);
    }
  });

  it("conditionWorkload が 0 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionWorkload: 0 });
    expect(result.success).toBe(false);
  });

  it("conditionWorkload が 6 はエラー", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionWorkload: 6 });
    expect(result.success).toBe(false);
  });

  it("conditionWorkload が null は有効", () => {
    const result = createMeetingSchema.safeParse({ ...baseInput, conditionWorkload: null });
    expect(result.success).toBe(true);
  });

  it("checkinNote が 500 文字以下で有効", () => {
    const result = createMeetingSchema.safeParse({
      ...baseInput,
      checkinNote: "a".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("checkinNote が 501 文字はエラー", () => {
    const result = createMeetingSchema.safeParse({
      ...baseInput,
      checkinNote: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("checkinNote が省略されたときデフォルト空文字", () => {
    const result = createMeetingSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.checkinNote).toBe("");
    }
  });

  it("全コンディションフィールドを同時に指定できる", () => {
    const result = createMeetingSchema.safeParse({
      ...baseInput,
      conditionHealth: 3,
      conditionMood: 4,
      conditionWorkload: 2,
      checkinNote: "体調はまあまあです",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conditionHealth).toBe(3);
      expect(result.data.conditionMood).toBe(4);
      expect(result.data.conditionWorkload).toBe(2);
      expect(result.data.checkinNote).toBe("体調はまあまあです");
    }
  });
});

describe("updateMeetingSchema - conditionフィールド", () => {
  const baseInput = {
    meetingId: "meeting-uuid",
    date: "2026-02-20T10:00:00.000Z",
    topics: [],
    actionItems: [],
    deletedTopicIds: [],
    deletedActionItemIds: [],
  };

  it("conditionHealth が 1-5 の範囲で有効", () => {
    for (const val of [1, 2, 3, 4, 5]) {
      const result = updateMeetingSchema.safeParse({ ...baseInput, conditionHealth: val });
      expect(result.success).toBe(true);
    }
  });

  it("conditionHealth が 0 はエラー", () => {
    const result = updateMeetingSchema.safeParse({ ...baseInput, conditionHealth: 0 });
    expect(result.success).toBe(false);
  });

  it("conditionHealth が 6 はエラー", () => {
    const result = updateMeetingSchema.safeParse({ ...baseInput, conditionHealth: 6 });
    expect(result.success).toBe(false);
  });

  it("conditionMood が 0 はエラー", () => {
    const result = updateMeetingSchema.safeParse({ ...baseInput, conditionMood: 0 });
    expect(result.success).toBe(false);
  });

  it("conditionWorkload が 6 はエラー", () => {
    const result = updateMeetingSchema.safeParse({ ...baseInput, conditionWorkload: 6 });
    expect(result.success).toBe(false);
  });

  it("checkinNote が 501 文字はエラー", () => {
    const result = updateMeetingSchema.safeParse({
      ...baseInput,
      checkinNote: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("全コンディションフィールドを同時に更新できる", () => {
    const result = updateMeetingSchema.safeParse({
      ...baseInput,
      conditionHealth: 5,
      conditionMood: 3,
      conditionWorkload: 4,
      checkinNote: "良い状態です",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.conditionHealth).toBe(5);
      expect(result.data.conditionMood).toBe(3);
      expect(result.data.conditionWorkload).toBe(4);
      expect(result.data.checkinNote).toBe("良い状態です");
    }
  });
});
