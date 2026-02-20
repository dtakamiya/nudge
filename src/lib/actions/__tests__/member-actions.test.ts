import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getMembers, getMember, createMember, updateMember, deleteMember } from "../member-actions";

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
