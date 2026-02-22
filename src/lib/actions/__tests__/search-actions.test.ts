import { beforeEach,describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";
import { searchAll } from "../search-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("searchAll", () => {
  it("空クエリは空の結果を返す", async () => {
    const result = await searchAll("");
    expect(result.success).toBe(false);
  });

  it("メンバー名で検索できる", async () => {
    await createMember({ name: "田中太郎", department: "エンジニアリング" });
    await createMember({ name: "山田花子", department: "デザイン" });

    const result = await searchAll("田中");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.members).toHaveLength(1);
    expect(result.data.members[0].name).toBe("田中太郎");
  });

  it("話題タイトルで検索できる", async () => {
    const memberResult = await createMember({ name: "テストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [
        { title: "キャリア相談について", notes: "詳細内容", category: "CAREER", sortOrder: 0 },
        { title: "業務進捗確認", notes: "定例確認", category: "WORK_PROGRESS", sortOrder: 1 },
      ],
      actionItems: [],
    });

    const result = await searchAll("キャリア");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics).toHaveLength(1);
    expect(result.data.topics[0].title).toBe("キャリア相談について");
  });

  it("話題ノートで検索できる", async () => {
    const memberResult = await createMember({ name: "ノート検索テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [
        {
          title: "定例ミーティング",
          notes: "スキルアップに向けた取り組みを話し合う",
          category: "OTHER",
          sortOrder: 0,
        },
      ],
      actionItems: [],
    });

    const result = await searchAll("スキルアップ");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics).toHaveLength(1);
    expect(result.data.topics[0].notes).toBe("スキルアップに向けた取り組みを話し合う");
  });

  it("アクションアイテムタイトルで検索できる", async () => {
    const memberResult = await createMember({ name: "アクション検索テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "プレゼン資料を作成する", description: "", sortOrder: 0 },
        { title: "コードレビューを実施する", description: "", sortOrder: 1 },
      ],
    });

    const result = await searchAll("プレゼン");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems).toHaveLength(1);
    expect(result.data.actionItems[0].title).toBe("プレゼン資料を作成する");
  });

  it("アクションアイテムの説明で検索できる", async () => {
    const memberResult = await createMember({ name: "説明検索テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "タスクA", description: "ドキュメントを整備する作業", sortOrder: 0 },
        { title: "タスクB", description: "テストを書く作業", sortOrder: 1 },
      ],
    });

    const result = await searchAll("ドキュメント");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems).toHaveLength(1);
    expect(result.data.actionItems[0].title).toBe("タスクA");
  });

  it("各カテゴリ最大5件を返す", async () => {
    const memberResult = await createMember({ name: "制限テスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: Array.from({ length: 7 }, (_, i) => ({
        title: `検索テスト話題${i + 1}`,
        notes: "",
        category: "OTHER" as const,
        sortOrder: i,
      })),
      actionItems: [],
    });

    const result = await searchAll("検索テスト");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics.length).toBeLessThanOrEqual(5);
  });

  it("結果にメンバーIDと名前が含まれる", async () => {
    const memberResult = await createMember({ name: "リンクテストメンバー" });
    if (!memberResult.success) throw new Error(memberResult.error);

    const result = await searchAll("リンクテスト");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.members[0]).toMatchObject({
      id: expect.any(String),
      name: "リンクテストメンバー",
    });
  });

  it("話題結果にmeetingIdとmemberId、memberNameが含まれる", async () => {
    const memberResult = await createMember({ name: "話題リンクテスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [{ title: "話題リンク確認", notes: "", category: "OTHER", sortOrder: 0 }],
      actionItems: [],
    });

    const result = await searchAll("話題リンク");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.topics[0]).toMatchObject({
      id: expect.any(String),
      title: "話題リンク確認",
      meetingId: expect.any(String),
      memberId: expect.any(String),
      memberName: expect.any(String),
    });
  });

  it("アクションアイテム結果にmemberId、meetingIdが含まれる", async () => {
    const memberResult = await createMember({ name: "アクションリンクテスト" });
    if (!memberResult.success) throw new Error(memberResult.error);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "アクションリンク確認", description: "", sortOrder: 0 }],
    });

    const result = await searchAll("アクションリンク");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.actionItems[0]).toMatchObject({
      id: expect.any(String),
      title: "アクションリンク確認",
      memberId: expect.any(String),
      memberName: expect.any(String),
      meetingId: expect.any(String),
    });
  });
});
