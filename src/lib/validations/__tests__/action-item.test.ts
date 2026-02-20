import { describe, it, expect } from "vitest";
import { updateActionItemStatusSchema } from "../action-item";

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
