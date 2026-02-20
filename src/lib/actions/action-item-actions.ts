"use server";

import { prisma } from "@/lib/prisma";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

type ActionItemFilters = {
  status?: ActionItemStatusType;
  memberId?: string;
};

export async function getActionItems(filters: ActionItemFilters = {}) {
  const where: Record<string, unknown> = {};
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

export async function updateActionItemStatus(id: string, status: ActionItemStatusType) {
  const completedAt = status === "DONE" ? new Date() : null;
  return prisma.actionItem.update({ where: { id }, data: { status, completedAt } });
}
