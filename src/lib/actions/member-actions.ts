"use server";

import { revalidatePath } from "next/cache";

import type { Member } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateMemberInput, UpdateMemberInput } from "@/lib/validations/member";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations/member";

import { type ActionResult,runAction } from "./types";

export async function getMembers() {
  const now = new Date();
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { actionItems: { where: { status: { not: "DONE" } } } } },
      meetings: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
      actionItems: {
        where: {
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
        select: { id: true },
      },
    },
  });

  return members.map((member) => ({
    ...member,
    overdueActionCount: member.actionItems.length,
    actionItems: undefined,
  }));
}

export async function getMember(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      meetings: {
        orderBy: { date: "desc" },
        include: { topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
      },
      actionItems: {
        orderBy: { createdAt: "desc" },
        include: { meeting: { select: { date: true } } },
      },
    },
  });
}

export async function createMember(input: CreateMemberInput): Promise<ActionResult<Member>> {
  return runAction(async () => {
    const validated = createMemberSchema.parse(input);
    const result = await prisma.member.create({ data: validated });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function updateMember(
  id: string,
  input: UpdateMemberInput,
): Promise<ActionResult<Member>> {
  return runAction(async () => {
    if (!id) throw new Error("メンバーIDが指定されていません");
    const validated = updateMemberSchema.parse(input);
    const result = await prisma.member.update({ where: { id }, data: validated });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function deleteMember(id: string): Promise<ActionResult<Member>> {
  return runAction(async () => {
    if (!id) throw new Error("メンバーIDが指定されていません");
    const result = await prisma.member.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
