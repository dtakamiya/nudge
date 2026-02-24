import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { runAction } from "../types";

describe("runAction", () => {
  it("成功時に success: true とデータを返す", async () => {
    const result = await runAction(async () => ({ id: "1", name: "test" }));
    expect(result).toEqual({ success: true, data: { id: "1", name: "test" } });
  });

  it("Error がスローされた場合に success: false とメッセージを返す", async () => {
    const result = await runAction(async () => {
      throw new Error("テストエラー");
    });
    expect(result).toEqual({ success: false, error: "テストエラー" });
  });

  it("非 Error がスローされた場合にデフォルトメッセージを返す", async () => {
    const result = await runAction(async () => {
      throw "string error";
    });
    expect(result).toEqual({ success: false, error: "予期しないエラーが発生しました" });
  });

  it("ZodError がスローされた場合にユーザー向けバリデーションメッセージを返す", async () => {
    const schema = z.object({
      title: z.string().min(1, "タイトルは必須です"),
      age: z.number().min(0, "年齢は0以上で入力してください"),
    });
    const result = await runAction(async () => {
      schema.parse({ title: "", age: -1 });
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("タイトルは必須です、年齢は0以上で入力してください");
    }
  });

  it("ZodError が単一の場合にそのメッセージのみを返す", async () => {
    const schema = z.object({ name: z.string().min(1, "名前は必須です") });
    const result = await runAction(async () => {
      schema.parse({ name: "" });
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("名前は必須です");
    }
  });

  it("ZodError がスローされた場合に fieldErrors にフィールドごとのエラーを返す", async () => {
    const schema = z.object({
      title: z.string().min(1, "タイトルは必須です"),
      age: z.number().min(0, "年齢は0以上で入力してください"),
    });
    const result = await runAction(async () => {
      schema.parse({ title: "", age: -1 });
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.title).toEqual(["タイトルは必須です"]);
      expect(result.fieldErrors?.age).toEqual(["年齢は0以上で入力してください"]);
    }
  });

  it("ZodError が単一フィールドの場合も fieldErrors に展開される", async () => {
    const schema = z.object({ name: z.string().min(1, "名前は必須です") });
    const result = await runAction(async () => {
      schema.parse({ name: "" });
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeDefined();
      expect(result.fieldErrors?.name).toEqual(["名前は必須です"]);
    }
  });

  it("通常の Error がスローされた場合は fieldErrors を含まない", async () => {
    const result = await runAction(async () => {
      throw new Error("通常エラー");
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors).toBeUndefined();
    }
  });

  it("ネストされたフィールドの ZodError はドット区切りキーで fieldErrors に展開される", async () => {
    const schema = z.object({
      topics: z.array(z.object({ title: z.string().min(1, "タイトルは必須") })),
    });
    const result = await runAction(async () => {
      schema.parse({ topics: [{ title: "" }] });
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.["topics.0.title"]).toEqual(["タイトルは必須"]);
    }
  });

  it("path が空の ZodError は _root キーで fieldErrors に展開される", async () => {
    const schema = z.string().min(1, "値は必須です");
    const result = await runAction(async () => {
      schema.parse("");
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.["_root"]).toEqual(["値は必須です"]);
    }
  });

  it("エラー発生時に console.error でサーバーサイドログを出力する", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await runAction(async () => {
      throw new Error("ログテスト");
    });
    expect(consoleSpy).toHaveBeenCalledWith("[Server Action Error]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
