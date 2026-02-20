import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getMembers, getMember, createMember, updateMember, deleteMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

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
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Tanaka Taro");
    expect(result.department).toBe("Engineering");
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
    const member = await createMember({ name: "Test" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: member.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue", description: "", dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", dueDate: tomorrow.toISOString() },
        { title: "No due", description: "" },
      ],
    });

    const members = await getMembers();
    expect(members[0]._count.actionItems).toBe(3); // all pending
    expect(members[0].overdueActionCount).toBe(1);
  });
});

describe("getMember", () => {
  it("returns member by id", async () => {
    const created = await createMember({ name: "Test Member" });
    const found = await getMember(created.id);
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
    const updated = await updateMember(created.id, { name: "New Name" });
    expect(updated.name).toBe("New Name");
  });
});

describe("deleteMember", () => {
  it("deletes member by id", async () => {
    const created = await createMember({ name: "To Delete" });
    await deleteMember(created.id);
    const found = await getMember(created.id);
    expect(found).toBeNull();
  });
});
