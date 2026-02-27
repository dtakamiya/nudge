import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import {
  createMemberNote,
  deleteMemberNote,
  getMemberNotes,
  updateMemberNote,
} from "../member-note-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.memberNote.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await prisma.member.create({
    data: { name: "テストメンバー" },
  });
  memberId = member.id;
});

describe("getMemberNotes", () => {
  it("メンバーのメモ一覧を日付降順で返す", async () => {
    await prisma.memberNote.createMany({
      data: [
        { memberId, content: "メモA", category: "good" },
        { memberId, content: "メモB", category: "improvement" },
      ],
    });
    const result = await getMemberNotes(memberId);
    expect(result).toHaveLength(2);
  });

  it("カテゴリでフィルタできる", async () => {
    await prisma.memberNote.createMany({
      data: [
        { memberId, content: "良い点", category: "good" },
        { memberId, content: "改善点", category: "improvement" },
        { memberId, content: "気づき", category: "notice" },
      ],
    });
    const result = await getMemberNotes(memberId, "good");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("good");
  });

  it("メモがない場合は空配列を返す", async () => {
    const result = await getMemberNotes(memberId);
    expect(result).toEqual([]);
  });
});

describe("createMemberNote", () => {
  it("メモを作成できる", async () => {
    const result = await createMemberNote({
      memberId,
      content: "プレゼンが上手だった",
      category: "good",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("プレゼンが上手だった");
      expect(result.data.category).toBe("good");
      expect(result.data.memberId).toBe(memberId);
    }
  });

  it("content が空の場合はエラーを返す", async () => {
    const result = await createMemberNote({
      memberId,
      content: "",
      category: "good",
    });
    expect(result.success).toBe(false);
  });

  it("不正な category の場合はエラーを返す", async () => {
    const result = await createMemberNote({
      memberId,
      content: "テスト",
      category: "invalid" as "good",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateMemberNote", () => {
  it("メモを更新できる", async () => {
    const created = await createMemberNote({
      memberId,
      content: "更新前",
      category: "good",
    });
    if (!created.success) throw new Error(created.error);
    const result = await updateMemberNote(created.data.id, {
      content: "更新後",
      category: "improvement",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("更新後");
      expect(result.data.category).toBe("improvement");
    }
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await updateMemberNote("", {
      content: "テスト",
      category: "good",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteMemberNote", () => {
  it("メモを削除できる", async () => {
    const created = await createMemberNote({
      memberId,
      content: "削除テスト",
      category: "notice",
    });
    if (!created.success) throw new Error(created.error);
    const result = await deleteMemberNote(created.data.id);
    expect(result.success).toBe(true);
    const remaining = await getMemberNotes(memberId);
    expect(remaining).toHaveLength(0);
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await deleteMemberNote("");
    expect(result.success).toBe(false);
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await deleteMemberNote("non-existent-id");
    expect(result.success).toBe(false);
  });
});
