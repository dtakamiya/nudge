import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { cleanDatabase } from "@/test-utils";

import {
  bulkDeleteActionItems,
  bulkUpdateActionItemStatus,
  createActionItemForMeeting,
} from "../action-item-actions";
import { createMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;
let meetingId: string;

beforeEach(async () => {
  await cleanDatabase();

  const memberResult = await createMember({ name: "Test Member" });
  if (!memberResult.success) throw new Error(memberResult.error);
  memberId = memberResult.data.id;

  const meetingResult = await createMeeting({
    memberId,
    date: new Date().toISOString(),
    topics: [],
    actionItems: [],
  });
  if (!meetingResult.success) throw new Error(meetingResult.error);
  meetingId = meetingResult.data.id;
});

async function createItem(title: string) {
  const r = await createActionItemForMeeting(meetingId, memberId, {
    title,
    description: "",
  });
  if (!r.success) throw new Error(r.error);
  return r.data;
}

describe("bulkUpdateActionItemStatus", () => {
  it("複数アイテムのステータスをまとめて変更できる", async () => {
    const a = await createItem("タスクA");
    const b = await createItem("タスクB");

    const result = await bulkUpdateActionItemStatus([a.id, b.id], "DONE");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.count).toBe(2);

    const updated = await prisma.actionItem.findMany({
      where: { id: { in: [a.id, b.id] } },
    });
    expect(updated.every((item) => item.status === "DONE")).toBe(true);
  });

  it("DONE に変更した場合 completedAt がセットされる", async () => {
    const a = await createItem("タスクA");

    const before = new Date();
    const result = await bulkUpdateActionItemStatus([a.id], "DONE");
    const after = new Date();

    expect(result.success).toBe(true);
    const updated = await prisma.actionItem.findUnique({ where: { id: a.id } });
    expect(updated?.completedAt).not.toBeNull();
    expect(updated?.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(updated?.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("DONE 以外に変更した場合 completedAt が null になる", async () => {
    const a = await createItem("タスクA");
    // まず DONE にする
    await bulkUpdateActionItemStatus([a.id], "DONE");

    // TODO に戻す
    const result = await bulkUpdateActionItemStatus([a.id], "TODO");
    expect(result.success).toBe(true);
    const updated = await prisma.actionItem.findUnique({ where: { id: a.id } });
    expect(updated?.completedAt).toBeNull();
  });

  it("空の ids を渡した場合エラーを返す", async () => {
    const result = await bulkUpdateActionItemStatus([], "DONE");
    expect(result.success).toBe(false);
  });

  it("不正なステータスを渡した場合エラーを返す", async () => {
    const a = await createItem("タスクA");
    const result = await bulkUpdateActionItemStatus([a.id], "INVALID");
    expect(result.success).toBe(false);
  });
});

describe("bulkDeleteActionItems", () => {
  it("複数アイテムをまとめて削除できる", async () => {
    const a = await createItem("タスクA");
    const b = await createItem("タスクB");
    const c = await createItem("タスクC");

    const result = await bulkDeleteActionItems([a.id, b.id]);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.count).toBe(2);

    const remaining = await prisma.actionItem.findMany({ where: { meetingId } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(c.id);
  });

  it("空の ids を渡した場合エラーを返す", async () => {
    const result = await bulkDeleteActionItems([]);
    expect(result.success).toBe(false);
  });

  it("存在しない id を渡した場合 count が 0 になる", async () => {
    const result = await bulkDeleteActionItems(["non-existent-id"]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.count).toBe(0);
  });
});
