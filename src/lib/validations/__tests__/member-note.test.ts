import { describe, expect, it } from "vitest";

import { createMemberNoteSchema, updateMemberNoteSchema } from "../member-note";

describe("createMemberNoteSchema", () => {
  it("正常な入力をパースできる", () => {
    const result = createMemberNoteSchema.parse({
      memberId: "550e8400-e29b-41d4-a716-446655440000",
      content: "プレゼンが上手だった",
      category: "good",
    });
    expect(result.content).toBe("プレゼンが上手だった");
    expect(result.category).toBe("good");
  });

  it("content が空の場合エラー", () => {
    expect(() =>
      createMemberNoteSchema.parse({
        memberId: "550e8400-e29b-41d4-a716-446655440000",
        content: "",
        category: "good",
      }),
    ).toThrow();
  });

  it("不正な category の場合エラー", () => {
    expect(() =>
      createMemberNoteSchema.parse({
        memberId: "550e8400-e29b-41d4-a716-446655440000",
        content: "テスト",
        category: "invalid",
      }),
    ).toThrow();
  });

  it("memberId が UUID でない場合エラー", () => {
    expect(() =>
      createMemberNoteSchema.parse({
        memberId: "not-a-uuid",
        content: "テスト",
        category: "good",
      }),
    ).toThrow();
  });
});

describe("updateMemberNoteSchema", () => {
  it("正常な入力をパースできる", () => {
    const result = updateMemberNoteSchema.parse({
      content: "更新後のメモ",
      category: "improvement",
    });
    expect(result.content).toBe("更新後のメモ");
    expect(result.category).toBe("improvement");
  });

  it("content が空の場合エラー", () => {
    expect(() =>
      updateMemberNoteSchema.parse({
        content: "",
        category: "good",
      }),
    ).toThrow();
  });
});
