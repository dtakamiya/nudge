import { describe, it, expect } from "vitest";
import { createMeetingSchema } from "../meeting";

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
