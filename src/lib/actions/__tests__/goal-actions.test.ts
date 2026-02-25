import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import {
  createGoal,
  deleteGoal,
  getActiveGoals,
  getGoals,
  updateGoal,
  updateGoalProgress,
} from "../goal-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.goal.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await prisma.member.create({
    data: { name: "テストメンバー" },
  });
  memberId = member.id;
});

describe("getGoals", () => {
  it("メンバーの目標一覧を返す", async () => {
    await prisma.goal.createMany({
      data: [
        { memberId, title: "目標A" },
        { memberId, title: "目標B", status: "COMPLETED", progress: 100 },
      ],
    });
    const result = await getGoals(memberId);
    expect(result).toHaveLength(2);
  });

  it("目標がない場合は空配列を返す", async () => {
    const result = await getGoals(memberId);
    expect(result).toEqual([]);
  });
});

describe("getActiveGoals", () => {
  it("進行中の目標のみを返す", async () => {
    await prisma.goal.createMany({
      data: [
        { memberId, title: "進行中", status: "IN_PROGRESS" },
        { memberId, title: "完了", status: "COMPLETED", progress: 100 },
        { memberId, title: "キャンセル", status: "CANCELLED" },
      ],
    });
    const result = await getActiveGoals(memberId);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("進行中");
  });
});

describe("createGoal", () => {
  it("目標を作成できる", async () => {
    const result = await createGoal(memberId, {
      title: "TypeScript習得",
      description: "型システムを理解する",
      progress: 20,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("TypeScript習得");
      expect(result.data.progress).toBe(20);
      expect(result.data.status).toBe("IN_PROGRESS");
    }
  });

  it("期限付きの目標を作成できる", async () => {
    const result = await createGoal(memberId, {
      title: "期限付き目標",
      dueDate: "2026-06-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).not.toBeNull();
    }
  });

  it("タイトルが空の場合はエラーを返す", async () => {
    const result = await createGoal(memberId, { title: "" });
    expect(result.success).toBe(false);
  });

  it("メンバーIDが空の場合はエラーを返す", async () => {
    const result = await createGoal("", { title: "目標" });
    expect(result.success).toBe(false);
  });
});

describe("updateGoal", () => {
  it("目標を部分更新できる", async () => {
    const created = await createGoal(memberId, { title: "更新前" });
    if (!created.success) throw new Error(created.error);
    const result = await updateGoal(created.data.id, { title: "更新後" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("更新後");
    }
  });

  it("ステータスをCOMPLETEDにすると進捗が自動的に100になる", async () => {
    const created = await createGoal(memberId, { title: "目標", progress: 50 });
    if (!created.success) throw new Error(created.error);
    const result = await updateGoal(created.data.id, { status: "COMPLETED" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progress).toBe(100);
    }
  });

  it("ステータスCOMPLETEDでprogress指定ありの場合は指定値を使う", async () => {
    const created = await createGoal(memberId, { title: "目標" });
    if (!created.success) throw new Error(created.error);
    const result = await updateGoal(created.data.id, { status: "COMPLETED", progress: 80 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progress).toBe(80);
    }
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await updateGoal("", { title: "テスト" });
    expect(result.success).toBe(false);
  });
});

describe("updateGoalProgress", () => {
  it("進捗を更新できる", async () => {
    const created = await createGoal(memberId, { title: "目標" });
    if (!created.success) throw new Error(created.error);
    const result = await updateGoalProgress(created.data.id, 60);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progress).toBe(60);
      expect(result.data.status).toBe("IN_PROGRESS");
    }
  });

  it("100%到達時に自動的にCOMPLETEDになる", async () => {
    const created = await createGoal(memberId, { title: "目標" });
    if (!created.success) throw new Error(created.error);
    const result = await updateGoalProgress(created.data.id, 100);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("COMPLETED");
    }
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await updateGoalProgress("", 50);
    expect(result.success).toBe(false);
  });
});

describe("deleteGoal", () => {
  it("目標を削除できる", async () => {
    const created = await createGoal(memberId, { title: "削除テスト" });
    if (!created.success) throw new Error(created.error);
    const result = await deleteGoal(created.data.id);
    expect(result.success).toBe(true);
    const remaining = await getGoals(memberId);
    expect(remaining).toHaveLength(0);
  });

  it("IDが空の場合はエラーを返す", async () => {
    const result = await deleteGoal("");
    expect(result.success).toBe(false);
  });

  it("存在しないIDの場合はエラーを返す", async () => {
    const result = await deleteGoal("non-existent-id");
    expect(result.success).toBe(false);
  });
});
