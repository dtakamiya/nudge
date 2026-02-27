import { describe, expect, it } from "vitest";

import {
  actionItemPriority,
  updateActionItemSchema,
  updateActionItemStatusSchema,
} from "../action-item";

describe("actionItemPriority", () => {
  it("HIGH / MEDIUM / LOW を受け入れる", () => {
    expect(actionItemPriority.parse("HIGH")).toBe("HIGH");
    expect(actionItemPriority.parse("MEDIUM")).toBe("MEDIUM");
    expect(actionItemPriority.parse("LOW")).toBe("LOW");
  });

  it("不正な値はエラーになる", () => {
    expect(() => actionItemPriority.parse("URGENT")).toThrow();
    expect(() => actionItemPriority.parse("")).toThrow();
  });
});

describe("updateActionItemStatusSchema", () => {
  it("accepts valid status", () => {
    const result = updateActionItemStatusSchema.safeParse({
      status: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateActionItemStatusSchema.safeParse({
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
      const result = updateActionItemStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateActionItemSchema", () => {
  it("有効な入力を受け付ける", () => {
    const result = updateActionItemSchema.safeParse({
      title: "タスク更新",
      description: "詳細説明",
      dueDate: "2026-03-01",
    });
    expect(result.success).toBe(true);
  });

  it("タイトル空文字を拒否する", () => {
    const result = updateActionItemSchema.safeParse({
      title: "",
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("description と dueDate は省略可能", () => {
    const result = updateActionItemSchema.safeParse({
      title: "タスク",
    });
    expect(result.success).toBe(true);
  });

  it("dueDate が空文字列の場合も許容する", () => {
    const result = updateActionItemSchema.safeParse({
      title: "タスク",
      description: "",
      dueDate: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateActionItemSchema - priority", () => {
  it("priority を含むオブジェクトを検証できる", () => {
    const result = updateActionItemSchema.parse({
      title: "タスク",
      description: "",
      priority: "HIGH",
    });
    expect(result.priority).toBe("HIGH");
  });

  it("priority を省略した場合は MEDIUM がデフォルト", () => {
    const result = updateActionItemSchema.parse({
      title: "タスク",
      description: "",
    });
    expect(result.priority).toBe("MEDIUM");
  });

  it("priority に不正な値はエラーになる", () => {
    expect(() =>
      updateActionItemSchema.parse({
        title: "タスク",
        description: "",
        priority: "CRITICAL",
      }),
    ).toThrow();
  });
});
