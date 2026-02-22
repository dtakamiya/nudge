import { describe, expect, it } from "vitest";

import { createMemberSchema, updateMemberSchema } from "../member";

describe("createMemberSchema", () => {
  it("accepts valid input", () => {
    const result = createMemberSchema.safeParse({
      name: "Tanaka Taro",
      department: "Engineering",
      position: "Senior Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = createMemberSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createMemberSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("allows optional department and position", () => {
    const result = createMemberSchema.safeParse({ name: "Suzuki Hanako" });
    expect(result.success).toBe(true);
  });
});

describe("updateMemberSchema", () => {
  it("accepts partial updates", () => {
    const result = updateMemberSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });
});
