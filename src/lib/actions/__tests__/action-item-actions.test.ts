import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getActionItems,
  getPendingActionItems,
  updateActionItemStatus,
  updateActionItem,
} from "../action-item-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const result = await createMember({ name: "Test Member" });
  if (!result.success) throw new Error(result.error);
  memberId = result.data.id;
});

describe("getActionItems", () => {
  it("returns all action items with member and meeting info", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    const items = await getActionItems();
    expect(items).toHaveLength(1);
    expect(items[0].member).toBeDefined();
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
    const items = await getActionItems();
    expect(items).toHaveLength(2);
    await updateActionItemStatus(items[0].id, "DONE");
    const todoItems = await getActionItems({ status: "TODO" });
    expect(todoItems).toHaveLength(1);
    expect(todoItems[0].title).toBe("Task B");
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
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Task A");
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
    await updateActionItemStatus(all.find((a) => a.title === "Done")!.id, "DONE");
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
    const items = await getActionItems();
    const result = await updateActionItemStatus(items[0].id, "IN_PROGRESS");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("IN_PROGRESS");
    expect(result.data.completedAt).toBeNull();
  });

  it("sets completedAt when marking DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItemStatus(items[0].id, "DONE");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("DONE");
    expect(result.data.completedAt).not.toBeNull();
  });

  it("clears completedAt when reverting from DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    await updateActionItemStatus(items[0].id, "DONE");
    const result = await updateActionItemStatus(items[0].id, "TODO");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.completedAt).toBeNull();
  });

  it("returns error for invalid status", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItemStatus(items[0].id, "INVALID");
    expect(result.success).toBe(false);
  });
});

describe("updateActionItem", () => {
  it("タイトルを更新できる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "旧タイトル", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { title: "新タイトル" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.title).toBe("新タイトル");
  });

  it("説明を更新できる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { description: "新しい説明" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.description).toBe("新しい説明");
  });

  it("期限日を変更できる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { dueDate: "2025-06-01" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.dueDate).not.toBeNull();
  });

  it("期限日をクリアできる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "", dueDate: "2025-06-01" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { dueDate: null });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.dueDate).toBeNull();
  });

  it("DONE に変更すると completedAt が設定される", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { status: "DONE" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.completedAt).not.toBeNull();
  });

  it("TODO に戻すと completedAt が null になる", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    await updateActionItemStatus(items[0].id, "DONE");
    const result = await updateActionItem(items[0].id, { status: "TODO" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.completedAt).toBeNull();
  });

  it("存在しない ID でエラーになる", async () => {
    const result = await updateActionItem("non-existent-id", { title: "New" });
    expect(result.success).toBe(false);
  });

  it("バリデーションエラーを返す", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const result = await updateActionItem(items[0].id, { title: "" });
    expect(result.success).toBe(false);
  });
});
