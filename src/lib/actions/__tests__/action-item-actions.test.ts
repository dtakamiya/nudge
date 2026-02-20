import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getActionItems,
  getPendingActionItems,
  updateActionItemStatus,
} from "../action-item-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await createMember({ name: "Test Member" });
  memberId = member.id;
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
    const member2 = await createMember({ name: "Member 2" });
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    await createMeeting({
      memberId: member2.id,
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
    const updated = await updateActionItemStatus(items[0].id, "IN_PROGRESS");
    expect(updated.status).toBe("IN_PROGRESS");
    expect(updated.completedAt).toBeNull();
  });

  it("sets completedAt when marking DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const updated = await updateActionItemStatus(items[0].id, "DONE");
    expect(updated.status).toBe("DONE");
    expect(updated.completedAt).not.toBeNull();
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
    const reverted = await updateActionItemStatus(items[0].id, "TODO");
    expect(reverted.completedAt).toBeNull();
  });
});
