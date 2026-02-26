import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import {
  createActionItemForMeeting,
  getActionItems,
  getLastMeetingAllActions,
  getLastMeetingPendingActions,
  getPendingActionItems,
  updateActionItem,
  updateActionItemStatus,
} from "../action-item-actions";
import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;
let meetingId: string;

beforeEach(async () => {
  await cleanDatabase();
  const result = await createMember({ name: "Test Member" });
  if (!result.success) throw new Error(result.error);
  memberId = result.data.id;
  const meetingResult = await createMeeting({
    memberId,
    date: new Date().toISOString(),
    topics: [],
    actionItems: [],
  });
  if (!meetingResult.success) throw new Error(meetingResult.error);
  meetingId = meetingResult.data.id;
});

describe("getActionItems", () => {
  it("returns all action items with member and meeting info", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    const result = await getActionItems();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].member).toBeDefined();
  });

  it("filters by status", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Task A", description: "" },
        { title: "Task B", description: "" },
      ],
    });
    const allResult = await getActionItems();
    expect(allResult.items).toHaveLength(2);
    await updateActionItemStatus(allResult.items[0].id, "DONE");
    const todoResult = await getActionItems({ status: "TODO" });
    expect(todoResult.items).toHaveLength(1);
    expect(todoResult.items[0].title).toBe("Task B");
  });

  it("filters by member", async () => {
    const member2Result = await createMember({ name: "Member 2" });
    if (!member2Result.success) throw new Error(member2Result.error);
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    await createMeeting({
      memberId: member2Result.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task B", description: "" }],
    });
    const filtered = await getActionItems({ memberId });
    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0].title).toBe("Task A");
  });

  it("pagination: perPage=2 で2件のみ返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Task A", description: "" },
        { title: "Task B", description: "" },
        { title: "Task C", description: "" },
      ],
    });
    const result = await getActionItems({ page: 1, perPage: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(1);
  });

  it("pagination: page=2 で残りの件数を返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Task A", description: "" },
        { title: "Task B", description: "" },
        { title: "Task C", description: "" },
      ],
    });
    const result = await getActionItems({ page: 2, perPage: 2 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it("ページを指定しない場合はデフォルトで page=1, perPage=20 を使用する", async () => {
    const result = await getActionItems();
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });
});

describe("getPendingActionItems", () => {
  it("returns only non-DONE items for a member", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Pending", description: "" },
        { title: "Done", description: "" },
      ],
    });
    const all = await getActionItems();
    await updateActionItemStatus(all.items.find((a) => a.title === "Done")!.id, "DONE");
    const pending = await getPendingActionItems(memberId);
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe("Pending");
  });
});

describe("updateActionItemStatus", () => {
  it("updates status to IN_PROGRESS", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItemStatus(result.items[0].id, "IN_PROGRESS");
    expect(updateResult.success).toBe(true);
    if (!updateResult.success) return;
    expect(updateResult.data.status).toBe("IN_PROGRESS");
    expect(updateResult.data.completedAt).toBeNull();
  });

  it("sets completedAt when marking DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItemStatus(result.items[0].id, "DONE");
    expect(updateResult.success).toBe(true);
    if (!updateResult.success) return;
    expect(updateResult.data.status).toBe("DONE");
    expect(updateResult.data.completedAt).not.toBeNull();
  });

  it("clears completedAt when reverting from DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    await updateActionItemStatus(result.items[0].id, "DONE");
    const revertResult = await updateActionItemStatus(result.items[0].id, "TODO");
    expect(revertResult.success).toBe(true);
    if (!revertResult.success) return;
    expect(revertResult.data.completedAt).toBeNull();
  });

  it("returns error for invalid status", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItemStatus(result.items[0].id, "INVALID");
    expect(updateResult.success).toBe(false);
  });
});

describe("updateActionItem", () => {
  it("タイトルを更新できる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Original", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItem(result.items[0].id, {
      title: "Updated",
      description: "",
    });
    expect(updateResult.success).toBe(true);
    if (!updateResult.success) return;
    expect(updateResult.data.title).toBe("Updated");
  });

  it("説明と期限日を更新できる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItem(result.items[0].id, {
      title: "Task",
      description: "Added desc",
      dueDate: "2026-03-15",
    });
    expect(updateResult.success).toBe(true);
    if (!updateResult.success) return;
    expect(updateResult.data.description).toBe("Added desc");
    expect(updateResult.data.dueDate).not.toBeNull();
  });

  it("空のタイトルはバリデーションエラーになる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItem(result.items[0].id, {
      title: "",
      description: "",
    });
    expect(updateResult.success).toBe(false);
  });

  it("空文字の dueDate は null として保存される", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "", dueDate: "2026-03-01" }],
    });
    const result = await getActionItems();
    const updateResult = await updateActionItem(result.items[0].id, {
      title: "Task",
      description: "",
      dueDate: "",
    });
    expect(updateResult.success).toBe(true);
    if (!updateResult.success) return;
    expect(updateResult.data.dueDate).toBeNull();
  });

  it("存在しないIDはエラーになる", async () => {
    const updateResult = await updateActionItem("nonexistent-id", {
      title: "Task",
      description: "",
    });
    expect(updateResult.success).toBe(false);
  });
});

describe("createActionItemForMeeting", () => {
  it("アクションアイテムを追加できる", async () => {
    const result = await createActionItemForMeeting(meetingId, memberId, {
      title: "新しいアクション",
      description: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe("新しいアクション");
    expect(result.data.meetingId).toBe(meetingId);
    expect(result.data.memberId).toBe(memberId);
  });

  it("期限日を設定できる", async () => {
    const result = await createActionItemForMeeting(meetingId, memberId, {
      title: "期限付きアクション",
      description: "",
      dueDate: "2026-04-01",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.dueDate).not.toBeNull();
  });

  it("空のタイトルはバリデーションエラーになる", async () => {
    const result = await createActionItemForMeeting(meetingId, memberId, {
      title: "",
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("sortOrder は既存アイテム数に基づいて設定される", async () => {
    await createActionItemForMeeting(meetingId, memberId, {
      title: "アクション1",
      description: "",
    });
    const result = await createActionItemForMeeting(meetingId, memberId, {
      title: "アクション2",
      description: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.sortOrder).toBe(1);
  });
});

describe("getLastMeetingAllActions", () => {
  it("ミーティングが存在しない場合は null を返す", async () => {
    const newMemberResult = await createMember({ name: "新規メンバー全件" });
    if (!newMemberResult.success) throw new Error(newMemberResult.error);
    const result = await getLastMeetingAllActions(newMemberResult.data.id);
    expect(result).toBeNull();
  });

  it("アクションが存在しない場合は null を返す", async () => {
    // beforeEach でアクションなしのミーティングが作成済み
    const result = await getLastMeetingAllActions(memberId);
    expect(result).toBeNull();
  });

  it("完了・未完了を分けて返す", async () => {
    const laterDate = new Date(Date.now() + 1000);
    await createMeeting({
      memberId,
      date: laterDate.toISOString(),
      topics: [],
      actionItems: [
        { title: "未完了タスク", description: "" },
        { title: "完了タスク", description: "" },
      ],
    });
    const items = await prisma.actionItem.findMany({ where: { memberId } });
    const doneItem = items.find((i) => i.title === "完了タスク");
    if (doneItem) {
      await prisma.actionItem.update({ where: { id: doneItem.id }, data: { status: "DONE" } });
    }

    const result = await getLastMeetingAllActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.completedActions).toHaveLength(1);
    expect(result!.completedActions[0].title).toBe("完了タスク");
    expect(result!.pendingActions).toHaveLength(1);
    expect(result!.pendingActions[0].title).toBe("未完了タスク");
  });

  it("完了のみの場合も返す", async () => {
    const laterDate = new Date(Date.now() + 1000);
    await createMeeting({
      memberId,
      date: laterDate.toISOString(),
      topics: [],
      actionItems: [{ title: "完了タスク", description: "" }],
    });
    const items = await prisma.actionItem.findMany({ where: { memberId } });
    for (const item of items) {
      await prisma.actionItem.update({ where: { id: item.id }, data: { status: "DONE" } });
    }

    const result = await getLastMeetingAllActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.completedActions).toHaveLength(1);
    expect(result!.pendingActions).toHaveLength(0);
  });

  it("最新のミーティングのアクションのみを返す", async () => {
    const futureDate1 = new Date();
    futureDate1.setFullYear(futureDate1.getFullYear() + 1);
    const futureDate2 = new Date();
    futureDate2.setFullYear(futureDate2.getFullYear() + 2);

    await createMeeting({
      memberId,
      date: futureDate1.toISOString(),
      topics: [],
      actionItems: [{ title: "古いタスク", description: "" }],
    });
    await createMeeting({
      memberId,
      date: futureDate2.toISOString(),
      topics: [],
      actionItems: [{ title: "新しいタスク", description: "" }],
    });

    const result = await getLastMeetingAllActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.pendingActions).toHaveLength(1);
    expect(result!.pendingActions[0].title).toBe("新しいタスク");
  });

  it("meetingId と meetingDate を返す", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await createMeeting({
      memberId,
      date: futureDate.toISOString(),
      topics: [],
      actionItems: [{ title: "タスク", description: "" }],
    });

    const result = await getLastMeetingAllActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.meetingId).toBeDefined();
    expect(result!.meetingDate).toBeInstanceOf(Date);
  });
});

describe("getActionItems - dateFilter: no-date", () => {
  it("dateFilter が 'no-date' のとき dueDate がないアイテムのみ返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "期限なしタスク", description: "" },
        { title: "期限ありタスク", description: "", dueDate: "2026-04-01" },
      ],
    });
    const result = await getActionItems({ dateFilter: "no-date" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("期限なしタスク");
    expect(result.items[0].dueDate).toBeNull();
  });

  it("no-date + メンバーフィルタの組み合わせが機能する", async () => {
    const member2Result = await createMember({ name: "Member 2 no-date" });
    if (!member2Result.success) throw new Error(member2Result.error);
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Member1 期限なし", description: "" }],
    });
    await createMeeting({
      memberId: member2Result.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Member2 期限なし", description: "" }],
    });
    const result = await getActionItems({ dateFilter: "no-date", memberId });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Member1 期限なし");
  });
});

describe("getActionItems - sortBy: updatedAt", () => {
  it("sortBy が 'updatedAt' のとき更新日降順で返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "古いタスク", description: "" },
        { title: "新しいタスク", description: "" },
      ],
    });

    const all = await getActionItems();
    const olderItem = all.items.find((i) => i.title === "古いタスク")!;
    const newerItem = all.items.find((i) => i.title === "新しいタスク")!;

    // Prisma で直接 updatedAt を設定して時刻差を確実に作る
    await prisma.actionItem.update({
      where: { id: olderItem.id },
      data: { updatedAt: new Date("2026-01-01T00:00:00Z") },
    });
    await prisma.actionItem.update({
      where: { id: newerItem.id },
      data: { updatedAt: new Date("2026-01-02T00:00:00Z") },
    });

    const result = await getActionItems({ sortBy: "updatedAt" });
    expect(result.items[0].title).toBe("新しいタスク");
    expect(result.items[1].title).toBe("古いタスク");
  });
});

describe("getLastMeetingPendingActions", () => {
  it("前回ミーティングの未完了アクションを返す", async () => {
    // beforeEach のミーティングより確実に新しい日付を使用（タイミング競合を防ぐ）
    const laterDate = new Date(Date.now() + 1000);
    await createMeeting({
      memberId,
      date: laterDate.toISOString(),
      topics: [],
      actionItems: [
        { title: "未完了タスク", description: "" },
        { title: "完了タスク", description: "" },
      ],
    });

    const items = await prisma.actionItem.findMany({ where: { memberId } });
    const doneItem = items.find((i) => i.title === "完了タスク");
    if (doneItem) {
      await prisma.actionItem.update({
        where: { id: doneItem.id },
        data: { status: "DONE" },
      });
    }

    const result = await getLastMeetingPendingActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.actions).toHaveLength(1);
    expect(result!.actions[0].title).toBe("未完了タスク");
    expect(result!.actions[0].status).not.toBe("DONE");
  });

  it("前回ミーティングが存在しない場合は null を返す", async () => {
    const newMemberResult = await createMember({ name: "新規メンバー引き継ぎ" });
    if (!newMemberResult.success) throw new Error(newMemberResult.error);
    const newMemberId = newMemberResult.data.id;

    const result = await getLastMeetingPendingActions(newMemberId);
    expect(result).toBeNull();
  });

  it("前回ミーティングの全アクションが完了済みの場合は null を返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "完了タスク", description: "" }],
    });

    const items = await prisma.actionItem.findMany({ where: { memberId } });
    for (const item of items) {
      await prisma.actionItem.update({
        where: { id: item.id },
        data: { status: "DONE" },
      });
    }

    const result = await getLastMeetingPendingActions(memberId);
    expect(result).toBeNull();
  });

  it("最新のミーティングのアクションのみを返す", async () => {
    // beforeEach で今日のミーティングが作成されるため、未来の日付を使用する
    const futureDate1 = new Date();
    futureDate1.setFullYear(futureDate1.getFullYear() + 1);
    const futureDate2 = new Date();
    futureDate2.setFullYear(futureDate2.getFullYear() + 2);

    await createMeeting({
      memberId,
      date: futureDate1.toISOString(),
      topics: [],
      actionItems: [{ title: "古いタスク", description: "" }],
    });
    await createMeeting({
      memberId,
      date: futureDate2.toISOString(),
      topics: [],
      actionItems: [{ title: "新しいタスク", description: "" }],
    });

    const result = await getLastMeetingPendingActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.actions).toHaveLength(1);
    expect(result!.actions[0].title).toBe("新しいタスク");
  });

  it("meetingDate と meetingId を返す", async () => {
    // beforeEach で今日のミーティングが作成されるため、未来の日付を使用する
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await createMeeting({
      memberId,
      date: futureDate.toISOString(),
      topics: [],
      actionItems: [{ title: "タスク", description: "" }],
    });

    const result = await getLastMeetingPendingActions(memberId);
    expect(result).not.toBeNull();
    expect(result!.meetingId).toBeDefined();
    expect(result!.meetingDate).toBeInstanceOf(Date);
  });
});
