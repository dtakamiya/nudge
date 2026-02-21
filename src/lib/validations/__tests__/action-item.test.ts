import { describe, it, expect } from "vitest";
import { updateActionItemStatusSchema, updateActionItemSchema } from "../action-item";

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
  it("全フィールド指定で valid", () => {
    const result = updateActionItemSchema.safeParse({
      title: "タスク",
      description: "説明文",
      status: "IN_PROGRESS",
      dueDate: "2025-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("title のみで valid", () => {
    const result = updateActionItemSchema.safeParse({ title: "タスク" });
    expect(result.success).toBe(true);
  });

  it("空 title で invalid", () => {
    const result = updateActionItemSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("不正 status で invalid", () => {
    const result = updateActionItemSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("dueDate: null で valid", () => {
    const result = updateActionItemSchema.safeParse({ dueDate: null });
    expect(result.success).toBe(true);
  });

  it("空オブジェクトで valid", () => {
    const result = updateActionItemSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
