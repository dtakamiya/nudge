import { describe, expect, it } from "vitest";

import { templateExportFileSchema, templateExportItemSchema } from "../template-schema";

describe("templateExportItemSchema", () => {
  it("有効なテンプレートアイテムをパースできる", () => {
    const result = templateExportItemSchema.safeParse({
      name: "週次レビュー",
      description: "説明",
      topics: [{ category: "WORK_PROGRESS", title: "進捗確認" }],
    });
    expect(result.success).toBe(true);
  });

  it("name が空はエラー", () => {
    const result = templateExportItemSchema.safeParse({ name: "", topics: [] });
    expect(result.success).toBe(false);
  });

  it("name が 100 文字超はエラー", () => {
    const result = templateExportItemSchema.safeParse({ name: "a".repeat(101), topics: [] });
    expect(result.success).toBe(false);
  });

  it("description が省略された場合はデフォルト空文字", () => {
    const result = templateExportItemSchema.safeParse({ name: "テスト", topics: [] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBe("");
  });

  it("topics が省略された場合はデフォルト空配列", () => {
    const result = templateExportItemSchema.safeParse({ name: "テスト" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.topics).toEqual([]);
  });

  it("無効なトピックカテゴリはエラー", () => {
    const result = templateExportItemSchema.safeParse({
      name: "テスト",
      topics: [{ category: "INVALID_CATEGORY", title: "タイトル" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("templateExportFileSchema", () => {
  const validFile = {
    version: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    templates: [{ name: "テスト", description: "", topics: [] }],
  };

  it("有効なエクスポートファイルをパースできる", () => {
    const result = templateExportFileSchema.safeParse(validFile);
    expect(result.success).toBe(true);
  });

  it("version が 1 以外はエラー", () => {
    const result = templateExportFileSchema.safeParse({ ...validFile, version: 2 });
    expect(result.success).toBe(false);
  });

  it("templates が空配列はエラー", () => {
    const result = templateExportFileSchema.safeParse({ ...validFile, templates: [] });
    expect(result.success).toBe(false);
  });

  it("exportedAt がない場合はエラー", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exportedAt: _, ...rest } = validFile;
    const result = templateExportFileSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("templates 内の不正なアイテムはエラー", () => {
    const result = templateExportFileSchema.safeParse({
      ...validFile,
      templates: [{ name: "", topics: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("複数テンプレートを含めてパースできる", () => {
    const result = templateExportFileSchema.safeParse({
      ...validFile,
      templates: [
        { name: "テンプレートA", topics: [] },
        { name: "テンプレートB", topics: [{ category: "CAREER", title: "キャリア" }] },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.templates).toHaveLength(2);
  });
});
