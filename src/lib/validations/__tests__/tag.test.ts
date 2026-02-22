import { describe, expect, it } from "vitest";

import { createTagSchema, updateTagSchema } from "../tag";

describe("createTagSchema", () => {
  describe("正常系", () => {
    it("1文字のタグ名を受け入れる", () => {
      const result = createTagSchema.safeParse({ name: "A" });
      expect(result.success).toBe(true);
    });

    it("30文字のタグ名を受け入れる", () => {
      const result = createTagSchema.safeParse({ name: "a".repeat(30) });
      expect(result.success).toBe(true);
    });

    it("有効なカラーコード付きで受け入れる", () => {
      const result = createTagSchema.safeParse({
        name: "重要",
        color: "#6366f1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBe("#6366f1");
      }
    });

    it("カラーコードなしで受け入れる（省略可）", () => {
      const result = createTagSchema.safeParse({ name: "重要" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.color).toBeUndefined();
      }
    });

    it("大文字を含むカラーコードを受け入れる", () => {
      const result = createTagSchema.safeParse({
        name: "タグ",
        color: "#6366F1",
      });
      expect(result.success).toBe(true);
    });

    it("名前の前後の空白をトリムする", () => {
      const result = createTagSchema.safeParse({ name: "  タグ  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("タグ");
      }
    });
  });

  describe("異常系", () => {
    it("空文字列を拒否する", () => {
      const result = createTagSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タグ名は1文字以上入力してください");
      }
    });

    it("31文字以上のタグ名を拒否する", () => {
      const result = createTagSchema.safeParse({ name: "a".repeat(31) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タグ名は30文字以内で入力してください");
      }
    });

    it("空白のみの名前をトリム後に拒否する", () => {
      const result = createTagSchema.safeParse({ name: "   " });
      expect(result.success).toBe(false);
    });

    it("#なしのカラーコードを拒否する", () => {
      const result = createTagSchema.safeParse({
        name: "タグ",
        color: "6366f1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "カラーコードは#で始まる6桁の16進数で入力してください",
        );
      }
    });

    it("3桁のカラーコードを拒否する", () => {
      const result = createTagSchema.safeParse({ name: "タグ", color: "#fff" });
      expect(result.success).toBe(false);
    });

    it("無効な文字を含むカラーコードを拒否する", () => {
      const result = createTagSchema.safeParse({
        name: "タグ",
        color: "#zzzzzz",
      });
      expect(result.success).toBe(false);
    });

    it("name フィールドがない場合を拒否する", () => {
      const result = createTagSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("updateTagSchema", () => {
  describe("正常系", () => {
    it("全フィールドを省略できる（全て任意）", () => {
      const result = updateTagSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("name のみを受け入れる", () => {
      const result = updateTagSchema.safeParse({ name: "更新タグ" });
      expect(result.success).toBe(true);
    });

    it("color のみを受け入れる", () => {
      const result = updateTagSchema.safeParse({ color: "#22c55e" });
      expect(result.success).toBe(true);
    });

    it("name と color を両方受け入れる", () => {
      const result = updateTagSchema.safeParse({
        name: "更新タグ",
        color: "#22c55e",
      });
      expect(result.success).toBe(true);
    });

    it("30文字の name を受け入れる", () => {
      const result = updateTagSchema.safeParse({ name: "a".repeat(30) });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("空文字列の name を拒否する", () => {
      const result = updateTagSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("31文字以上の name を拒否する", () => {
      const result = updateTagSchema.safeParse({ name: "a".repeat(31) });
      expect(result.success).toBe(false);
    });

    it("不正なカラーコードを拒否する", () => {
      const result = updateTagSchema.safeParse({ color: "invalid" });
      expect(result.success).toBe(false);
    });

    it("#なしのカラーコードを拒否する", () => {
      const result = updateTagSchema.safeParse({ color: "6366f1" });
      expect(result.success).toBe(false);
    });
  });
});
