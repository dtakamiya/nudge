import { beforeEach,describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import { createMeeting } from "../meeting-actions";
import { createMember, deleteMember,getMember, getMembers, updateMember } from "../member-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("createMember", () => {
  it("creates a member with valid data", async () => {
    const result = await createMember({
      name: "Tanaka Taro",
      department: "Engineering",
      position: "Senior",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();
    expect(result.data.name).toBe("Tanaka Taro");
    expect(result.data.department).toBe("Engineering");
  });

  it("returns error for invalid data", async () => {
    const result = await createMember({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("getMembers", () => {
  it("returns all members", async () => {
    await createMember({ name: "Member A" });
    await createMember({ name: "Member B" });
    const members = await getMembers();
    expect(members).toHaveLength(2);
  });

  it("includes overdue action count per member", async () => {
    const memberResult = await createMember({ name: "Test" });
    if (!memberResult.success) throw new Error(memberResult.error);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: memberResult.data.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue", description: "", sortOrder: 0, dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", sortOrder: 1, dueDate: tomorrow.toISOString() },
        { title: "No due", description: "", sortOrder: 2 },
      ],
    });

    const members = await getMembers();
    expect(members[0]._count.actionItems).toBe(3); // all pending
    expect(members[0].overdueActionCount).toBe(1);
  });
});

describe("getMember", () => {
  it("returns member by id", async () => {
    const result = await createMember({ name: "Test Member" });
    if (!result.success) throw new Error(result.error);
    const found = await getMember(result.data.id);
    expect(found?.name).toBe("Test Member");
  });
  it("returns null for non-existent id", async () => {
    const found = await getMember("non-existent");
    expect(found).toBeNull();
  });
});

describe("updateMember", () => {
  it("updates member fields", async () => {
    const created = await createMember({ name: "Old Name" });
    if (!created.success) throw new Error(created.error);
    const updated = await updateMember(created.data.id, { name: "New Name" });
    expect(updated.success).toBe(true);
    if (!updated.success) return;
    expect(updated.data.name).toBe("New Name");
  });

  it("returns error for empty id", async () => {
    const result = await updateMember("", { name: "New" });
    expect(result.success).toBe(false);
  });
});

describe("deleteMember", () => {
  it("deletes member by id", async () => {
    const created = await createMember({ name: "To Delete" });
    if (!created.success) throw new Error(created.error);
    const deleted = await deleteMember(created.data.id);
    expect(deleted.success).toBe(true);
    const found = await getMember(created.data.id);
    expect(found).toBeNull();
  });

  it("returns error for empty id", async () => {
    const result = await deleteMember("");
    expect(result.success).toBe(false);
  });
});
