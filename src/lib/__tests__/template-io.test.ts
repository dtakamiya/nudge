import { describe, expect, it, vi } from "vitest";

import { downloadTemplatesAsJson, readTemplateFile } from "../template-io";

describe("downloadTemplatesAsJson", () => {
  it("JSON ファイルのダウンロードをトリガーする", () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:test");
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.fn();
    const appendChildMock = vi.fn();
    const removeChildMock = vi.fn();

    Object.defineProperty(globalThis, "URL", {
      value: { createObjectURL: createObjectURLMock, revokeObjectURL: revokeObjectURLMock },
      writable: true,
    });

    const anchorEl = {
      href: "",
      download: "",
      click: clickMock,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, "createElement").mockReturnValueOnce(anchorEl);
    vi.spyOn(document.body, "appendChild").mockImplementation(appendChildMock);
    vi.spyOn(document.body, "removeChild").mockImplementation(removeChildMock);

    const data = {
      version: 1 as const,
      exportedAt: "2026-01-01T00:00:00.000Z",
      templates: [{ name: "テスト", description: "", topics: [] }],
    };

    downloadTemplatesAsJson(data);

    expect(createObjectURLMock).toHaveBeenCalledOnce();
    expect(clickMock).toHaveBeenCalledOnce();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:test");
    expect(anchorEl.download).toMatch(/nudge-templates-\d{4}-\d{2}-\d{2}\.json/);
  });
});

describe("readTemplateFile", () => {
  function makeFile(content: string, name = "templates.json"): File {
    return new File([content], name, { type: "application/json" });
  }

  it("有効な JSON ファイルを読み込める", async () => {
    const data = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      templates: [
        {
          name: "週次レビュー",
          description: "説明",
          topics: [{ category: "WORK_PROGRESS", title: "進捗" }],
        },
      ],
    };
    const file = makeFile(JSON.stringify(data));
    const result = await readTemplateFile(file);
    expect(result.version).toBe(1);
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0].name).toBe("週次レビュー");
  });

  it("JSON でないファイルはエラーをスローする", async () => {
    const file = makeFile("これはJSONではありません");
    await expect(readTemplateFile(file)).rejects.toThrow("JSONの解析に失敗しました");
  });

  it("スキーマが不正な JSON はエラーをスローする", async () => {
    const file = makeFile(JSON.stringify({ version: 2, exportedAt: "2026-01-01", templates: [] }));
    await expect(readTemplateFile(file)).rejects.toThrow("無効なファイル形式です");
  });

  it("templates が空配列の場合はバリデーションエラー", async () => {
    const file = makeFile(
      JSON.stringify({ version: 1, exportedAt: "2026-01-01T00:00:00.000Z", templates: [] }),
    );
    await expect(readTemplateFile(file)).rejects.toThrow("無効なファイル形式です");
  });

  it("templates 内のトピックカテゴリが不正な場合はエラー", async () => {
    const data = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      templates: [
        { name: "テスト", description: "", topics: [{ category: "INVALID", title: "タイトル" }] },
      ],
    };
    const file = makeFile(JSON.stringify(data));
    await expect(readTemplateFile(file)).rejects.toThrow("無効なファイル形式です");
  });
});
