"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { updateActionItemStatusSchema } from "@/lib/validations/action-item";
import type { ActionItemStatusType } from "@/lib/validations/action-item";
import type { Prisma } from "@/generated/prisma/client";

type ActionItemFilters = {
  status?: ActionItemStatusType;
  memberId?: string;
};

export async function getActionItems(filters: ActionItemFilters = {}) {
  const where: Prisma.ActionItemWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.memberId) where.memberId = filters.memberId;
  return prisma.actionItem.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      member: { select: { id: true, name: true } },
      meeting: { select: { id: true, date: true } },
    },
  });
}

export async function getPendingActionItems(memberId: string) {
  return prisma.actionItem.findMany({
    where: { memberId, status: { not: "DONE" } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: { meeting: { select: { id: true, date: true } } },
  });
}

export async function updateActionItemStatus(id: string, status: string) {
  const { status: validatedStatus } = updateActionItemStatusSchema.parse({ status });
  if (!id) throw new Error("Invalid action item ID");
  const completedAt = validatedStatus === "DONE" ? new Date() : null;
  const result = await prisma.actionItem.update({
    where: { id },
    data: { status: validatedStatus, completedAt },
  });
  revalidatePath("/", "layout");
  return result;
}
