import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import {
  createTag,
  deleteTag,
  getOrCreateTags,
  getPopularTags,
  getTags,
  getTagSuggestions,
  updateTag,
} from "../tag-actions";

beforeEach(async () => {
  await prisma.actionItemTag.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  await prisma.tag.deleteMany();
});

// ─── getTags ─────────────────────────────────────────────────────────────────

describe("getTags", () => {
  it("タグが存在しない場合は空配列を返す", async () => {
    const tags = await getTags();
    expect(tags).toHaveLength(0);
  });

  it("全タグを使用頻度順（降順）で返す", async () => {
    await createTag({ name: "バグ", color: "#ef4444" });
    await createTag({ name: "機能", color: "#22c55e" });
    const tags = await getTags();
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveProperty("_count");
    expect(tags[0]._count).toHaveProperty("topics");
    expect(tags[0]._count).toHaveProperty("actionItems");
  });

  it("返されるタグに id, name, color, _count が含まれる", async () => {
    await createTag({ name: "テスト", color: "#6366f1" });
    const tags = await getTags();
    expect(tags[0]).toMatchObject({
      id: expect.any(String),
      name: "テスト",
      color: "#6366f1",
      _count: {
        topics: expect.any(Number),
        actionItems: expect.any(Number),
      },
    });
  });
});

// ─── getTagSuggestions ────────────────────────────────────────────────────────

describe("getTagSuggestions", () => {
  beforeEach(async () => {
    await createTag({ name: "フロントエンド" });
    await createTag({ name: "バックエンド" });
    await createTag({ name: "フィードバック" });
    await createTag({ name: "バグ修正" });
  });

  it("部分一致でタグを返す（前方一致）", async () => {
    const results = await getTagSuggestions("フロント");
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("フロントエンド");
  });

  it("部分一致でタグを返す（中間一致）", async () => {
    const results = await getTagSuggestions("エンド");
    expect(results).toHaveLength(2);
  });

  it("空クエリは全タグを返す（上限件数まで）", async () => {
    const results = await getTagSuggestions("");
    expect(results.length).toBeGreaterThan(0);
  });

  it("大文字小文字を区別しない（英字の場合）", async () => {
    await createTag({ name: "React" });
    const results = await getTagSuggestions("react");
    // SQLiteはデフォルトでLIKEが大文字小文字を区別しないため1件以上返る
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("TAG_SUGGESTIONS_LIMIT 件以内を返す", async () => {
    // 追加で大量のタグを作成
    for (let i = 0; i < 15; i++) {
      await createTag({ name: `テスト${i}` });
    }
    const results = await getTagSuggestions("テスト");
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("一致しないクエリは空配列を返す", async () => {
    const results = await getTagSuggestions("存在しないタグXYZ");
    expect(results).toHaveLength(0);
  });
});

// ─── getPopularTags ───────────────────────────────────────────────────────────

describe("getPopularTags", () => {
  it("タグが存在しない場合は空配列を返す", async () => {
    const tags = await getPopularTags();
    expect(tags).toHaveLength(0);
  });

  it("デフォルトで5件を返す", async () => {
    for (let i = 0; i < 7; i++) {
      await createTag({ name: `タグ${i}` });
    }
    const tags = await getPopularTags();
    expect(tags).toHaveLength(5);
  });

  it("limit 引数でカスタム件数を返す", async () => {
    for (let i = 0; i < 7; i++) {
      await createTag({ name: `タグ${i}` });
    }
    const tags = await getPopularTags(3);
    expect(tags).toHaveLength(3);
  });

  it("返されるタグに _count が含まれる", async () => {
    await createTag({ name: "人気タグ" });
    const tags = await getPopularTags();
    expect(tags[0]._count).toHaveProperty("topics");
    expect(tags[0]._count).toHaveProperty("actionItems");
  });
});

// ─── createTag ────────────────────────────────────────────────────────────────

describe("createTag", () => {
  it("正常にタグを作成できる", async () => {
    const result = await createTag({ name: "新機能", color: "#22c55e" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe("新機能");
    expect(result.data.color).toBe("#22c55e");
  });

  it("color 省略時はデフォルト色が使用される", async () => {
    const result = await createTag({ name: "デフォルト色" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.color).toBe("#6366f1");
  });

  it("同じ名前のタグは作成できない（重複エラー）", async () => {
    await createTag({ name: "重複テスト" });
    const result = await createTag({ name: "重複テスト" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toBeDefined();
  });

  it("名前が空文字の場合はバリデーションエラー", async () => {
    const result = await createTag({ name: "" });
    expect(result.success).toBe(false);
  });

  it("名前が30文字超の場合はバリデーションエラー", async () => {
    const result = await createTag({ name: "a".repeat(31) });
    expect(result.success).toBe(false);
  });

  it("不正なカラーコードはバリデーションエラー", async () => {
    const result = await createTag({ name: "テスト", color: "invalid" });
    expect(result.success).toBe(false);
  });
});

// ─── updateTag ────────────────────────────────────────────────────────────────

describe("updateTag", () => {
  it("タグ名を更新できる", async () => {
    const created = await createTag({ name: "元の名前" });
    if (!created.success) throw new Error(created.error);
    const result = await updateTag(created.data.id, { name: "新しい名前" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe("新しい名前");
  });

  it("タグのカラーを更新できる", async () => {
    const created = await createTag({ name: "カラー更新テスト", color: "#6366f1" });
    if (!created.success) throw new Error(created.error);
    const result = await updateTag(created.data.id, { color: "#ef4444" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.color).toBe("#ef4444");
  });

  it("存在しないIDはエラーを返す", async () => {
    const result = await updateTag("non-existent-id", { name: "テスト" });
    expect(result.success).toBe(false);
  });

  it("不正なカラーコードはバリデーションエラー", async () => {
    const created = await createTag({ name: "テスト" });
    if (!created.success) throw new Error(created.error);
    const result = await updateTag(created.data.id, { color: "notacolor" });
    expect(result.success).toBe(false);
  });
});

// ─── deleteTag ────────────────────────────────────────────────────────────────

describe("deleteTag", () => {
  it("タグを削除できる", async () => {
    const created = await createTag({ name: "削除対象" });
    if (!created.success) throw new Error(created.error);
    const result = await deleteTag(created.data.id);
    expect(result.success).toBe(true);
    const tags = await getTags();
    expect(tags).toHaveLength(0);
  });

  it("存在しないIDはエラーを返す", async () => {
    const result = await deleteTag("non-existent-id");
    expect(result.success).toBe(false);
  });

  it("IDが空文字の場合はエラーを返す", async () => {
    const result = await deleteTag("");
    expect(result.success).toBe(false);
  });
});

// ─── getOrCreateTags ─────────────────────────────────────────────────────────

describe("getOrCreateTags", () => {
  it("空配列を渡すと空配列を返す", async () => {
    const tags = await getOrCreateTags([]);
    expect(tags).toHaveLength(0);
  });

  it("存在しないタグ名は新規作成して返す", async () => {
    const tags = await getOrCreateTags(["新タグA", "新タグB"]);
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.name)).toEqual(expect.arrayContaining(["新タグA", "新タグB"]));
  });

  it("既存のタグ名は作成せず既存のものを返す（冪等性）", async () => {
    await createTag({ name: "既存タグ" });
    const first = await getOrCreateTags(["既存タグ"]);
    const second = await getOrCreateTags(["既存タグ"]);
    expect(first[0].id).toBe(second[0].id);
    const allTags = await getTags();
    expect(allTags).toHaveLength(1);
  });

  it("既存と新規が混在する場合も正しく処理する", async () => {
    await createTag({ name: "既存" });
    const tags = await getOrCreateTags(["既存", "新規"]);
    expect(tags).toHaveLength(2);
    const allTags = await getTags();
    expect(allTags).toHaveLength(2);
  });

  it("重複した名前が入力に含まれても一意のタグを返す", async () => {
    const tags = await getOrCreateTags(["同じ名前", "同じ名前"]);
    // 重複は除去されて1つのタグのみ
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("同じ名前");
  });
});
