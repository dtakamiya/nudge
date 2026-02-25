import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import {
  createTemplate,
  deleteTemplate,
  exportTemplates,
  getCustomTemplates,
  importTemplates,
  previewImport,
  updateTemplate,
} from "../template-actions";

beforeEach(async () => {
  await prisma.meetingTemplate.deleteMany();
});

describe("getCustomTemplates", () => {
  it("空の場合は空配列を返す", async () => {
    const result = await getCustomTemplates();
    expect(result).toEqual([]);
  });

  it("カスタムテンプレートのみを返す", async () => {
    await prisma.meetingTemplate.createMany({
      data: [
        { name: "カスタムA", topics: [], isDefault: false },
        { name: "デフォルトB", topics: [], isDefault: true },
      ],
    });
    const result = await getCustomTemplates();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("カスタムA");
  });

  it("createdAt 昇順で返す", async () => {
    await prisma.meetingTemplate.create({
      data: { name: "後から作成", topics: [], isDefault: false },
    });
    await prisma.meetingTemplate.create({
      data: { name: "先に作成", topics: [], isDefault: false },
    });
    const result = await getCustomTemplates();
    expect(result[0].name).toBe("後から作成");
    expect(result[1].name).toBe("先に作成");
  });
});

describe("createTemplate", () => {
  it("テンプレートを作成できる", async () => {
    const result = await createTemplate({
      name: "週次レビュー",
      description: "週次の振り返り",
      topics: [{ category: "WORK_PROGRESS", title: "今週の進捗" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("週次レビュー");
      expect(result.data.isDefault).toBe(false);
    }
  });

  it("名前が重複している場合はエラーを返す", async () => {
    await createTemplate({ name: "重複テンプレート", topics: [] });
    const result = await createTemplate({ name: "重複テンプレート", topics: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("重複テンプレート");
    }
  });

  it("名前が空の場合はバリデーションエラーを返す", async () => {
    const result = await createTemplate({ name: "", topics: [] });
    expect(result.success).toBe(false);
  });

  it("名前が100文字を超える場合はバリデーションエラーを返す", async () => {
    const result = await createTemplate({ name: "a".repeat(101), topics: [] });
    expect(result.success).toBe(false);
  });

  it("トピックなしで作成できる（フリーテンプレート）", async () => {
    const result = await createTemplate({ name: "フリー", topics: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topics).toEqual([]);
    }
  });
});

describe("updateTemplate", () => {
  it("テンプレートを更新できる", async () => {
    const created = await createTemplate({ name: "更新前", topics: [] });
    if (!created.success) throw new Error(created.error);
    const result = await updateTemplate(created.data.id, {
      name: "更新後",
      description: "説明追加",
      topics: [{ category: "CAREER", title: "キャリア相談" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("更新後");
      expect(result.data.description).toBe("説明追加");
    }
  });

  it("別テンプレートと名前が重複している場合はエラーを返す", async () => {
    await createTemplate({ name: "テンプレートA", topics: [] });
    const b = await createTemplate({ name: "テンプレートB", topics: [] });
    if (!b.success) throw new Error(b.error);
    const result = await updateTemplate(b.data.id, { name: "テンプレートA", topics: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("テンプレートA");
    }
  });

  it("同じ名前で自分自身を更新できる", async () => {
    const created = await createTemplate({ name: "自己更新", topics: [] });
    if (!created.success) throw new Error(created.error);
    const result = await updateTemplate(created.data.id, {
      name: "自己更新",
      description: "説明変更",
      topics: [],
    });
    expect(result.success).toBe(true);
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await updateTemplate("", { name: "テスト", topics: [] });
    expect(result.success).toBe(false);
  });
});

describe("deleteTemplate", () => {
  it("カスタムテンプレートを削除できる", async () => {
    const created = await createTemplate({ name: "削除テスト", topics: [] });
    if (!created.success) throw new Error(created.error);
    const result = await deleteTemplate(created.data.id);
    expect(result.success).toBe(true);
    const remaining = await getCustomTemplates();
    expect(remaining).toHaveLength(0);
  });

  it("デフォルトテンプレートは削除できない", async () => {
    const template = await prisma.meetingTemplate.create({
      data: { name: "デフォルト", topics: [], isDefault: true },
    });
    const result = await deleteTemplate(template.id);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("デフォルトテンプレートは削除できません");
    }
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await deleteTemplate("non-existent-id");
    expect(result.success).toBe(false);
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await deleteTemplate("");
    expect(result.success).toBe(false);
  });
});

describe("exportTemplates", () => {
  it("カスタムテンプレートをエクスポートできる", async () => {
    await createTemplate({
      name: "エクスポートテスト",
      description: "説明",
      topics: [{ category: "WORK_PROGRESS", title: "進捗" }],
    });
    const result = await exportTemplates();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(1);
      expect(typeof result.data.exportedAt).toBe("string");
      expect(result.data.templates).toHaveLength(1);
      expect(result.data.templates[0].name).toBe("エクスポートテスト");
      expect(result.data.templates[0].description).toBe("説明");
    }
  });

  it("デフォルトテンプレートはエクスポートに含まれない", async () => {
    await prisma.meetingTemplate.create({
      data: { name: "デフォルト", topics: [], isDefault: true },
    });
    await createTemplate({ name: "カスタム", topics: [] });
    const result = await exportTemplates();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templates).toHaveLength(1);
      expect(result.data.templates[0].name).toBe("カスタム");
    }
  });

  it("テンプレートがない場合でも空配列で返せる", async () => {
    const result = await exportTemplates();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templates).toHaveLength(0);
    }
  });
});

describe("previewImport", () => {
  const validImportData = {
    version: 1,
    exportedAt: "2026-01-01T00:00:00.000Z",
    templates: [
      { name: "新規テンプレート", description: "説明", topics: [] },
      { name: "重複テンプレート", description: "", topics: [] },
    ],
  };

  it("重複なしの場合 duplicateNames が空", async () => {
    const result = await previewImport(validImportData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duplicateNames).toHaveLength(0);
      expect(result.data.templates).toHaveLength(2);
    }
  });

  it("既存テンプレートと名前が重複する場合 duplicateNames に含まれる", async () => {
    await createTemplate({ name: "重複テンプレート", topics: [] });
    const result = await previewImport(validImportData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duplicateNames).toContain("重複テンプレート");
      expect(result.data.duplicateNames).not.toContain("新規テンプレート");
    }
  });

  it("不正なデータはエラーを返す", async () => {
    const result = await previewImport({ invalid: "data" });
    expect(result.success).toBe(false);
  });
});

describe("importTemplates", () => {
  const makeImportData = (templates: Array<{ name: string; description?: string }>) => ({
    version: 1 as const,
    exportedAt: "2026-01-01T00:00:00.000Z",
    templates: templates.map((t) => ({
      name: t.name,
      description: t.description ?? "",
      topics: [],
    })),
  });

  it("新規テンプレートを作成できる", async () => {
    const result = await importTemplates(makeImportData([{ name: "新規A" }]), []);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.created).toBe(1);
      expect(result.data.updated).toBe(0);
      expect(result.data.skipped).toBe(0);
    }
    const all = await getCustomTemplates();
    expect(all.some((t) => t.name === "新規A")).toBe(true);
  });

  it("重複テンプレートはデフォルトでスキップされる", async () => {
    await createTemplate({ name: "既存テンプレート", description: "旧説明", topics: [] });
    const result = await importTemplates(
      makeImportData([{ name: "既存テンプレート", description: "新説明" }]),
      [],
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skipped).toBe(1);
      expect(result.data.updated).toBe(0);
    }
    const all = await getCustomTemplates();
    expect(all.find((t) => t.name === "既存テンプレート")?.description).toBe("旧説明");
  });

  it("overwriteNames に含まれる場合は上書き更新される", async () => {
    await createTemplate({ name: "上書き対象", description: "旧説明", topics: [] });
    const result = await importTemplates(
      makeImportData([{ name: "上書き対象", description: "新説明" }]),
      ["上書き対象"],
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updated).toBe(1);
      expect(result.data.skipped).toBe(0);
    }
    const all = await getCustomTemplates();
    expect(all.find((t) => t.name === "上書き対象")?.description).toBe("新説明");
  });

  it("新規・更新・スキップが混在する場合を正しく処理する", async () => {
    await createTemplate({ name: "スキップ対象", topics: [] });
    await createTemplate({ name: "更新対象", description: "旧", topics: [] });
    const result = await importTemplates(
      makeImportData([
        { name: "新規X" },
        { name: "スキップ対象" },
        { name: "更新対象", description: "新" },
      ]),
      ["更新対象"],
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.created).toBe(1);
      expect(result.data.updated).toBe(1);
      expect(result.data.skipped).toBe(1);
    }
  });

  it("不正なデータはエラーを返す", async () => {
    const result = await importTemplates({ invalid: "data" }, []);
    expect(result.success).toBe(false);
  });
});
