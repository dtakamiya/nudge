"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations/member";
import type { CreateMemberInput, UpdateMemberInput } from "@/lib/validations/member";

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

export async function createMember(input: CreateMemberInput) {
  const validated = createMemberSchema.parse(input);
  const result = await prisma.member.create({ data: validated });
  revalidatePath("/", "layout");
  return result;
}

export async function updateMember(id: string, input: UpdateMemberInput) {
  if (!id) throw new Error("Invalid member ID");
  const validated = updateMemberSchema.parse(input);
  const result = await prisma.member.update({ where: { id }, data: validated });
  revalidatePath("/", "layout");
  return result;
}

export async function deleteMember(id: string) {
  if (!id) throw new Error("Invalid member ID");
  const result = await prisma.member.delete({ where: { id } });
  revalidatePath("/", "layout");
  return result;
}
