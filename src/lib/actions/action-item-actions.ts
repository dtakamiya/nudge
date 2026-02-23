"use server";

import { revalidatePath } from "next/cache";

import type { ActionItem, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionItemStatusType, UpdateActionItemInput } from "@/lib/validations/action-item";
import {
  updateActionItemSchema,
  updateActionItemStatusSchema,
} from "@/lib/validations/action-item";

import { type ActionResult, runAction } from "./types";

export type DateFilterType = "all" | "overdue" | "this-week" | "this-month";
export type SortByType = "dueDate" | "createdAt" | "memberName";

type ActionItemFilters = {
  status?: ActionItemStatusType;
  memberId?: string;
  tagIds?: string[];
  keyword?: string;
  dateFilter?: DateFilterType;
  sortBy?: SortByType;
  page?: number;
  perPage?: number;
};

function buildDateFilter(dateFilter: DateFilterType): Prisma.ActionItemWhereInput {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateFilter === "overdue") {
    return { dueDate: { lt: today }, status: { not: "DONE" } };
  }
  if (dateFilter === "this-week") {
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return { dueDate: { gte: weekStart, lt: weekEnd } };
  }
  if (dateFilter === "this-month") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { dueDate: { gte: monthStart, lt: monthEnd } };
  }
  return {};
}

function buildOrderBy(sortBy: SortByType): Prisma.ActionItemOrderByWithRelationInput[] {
  if (sortBy === "createdAt") return [{ createdAt: "desc" }];
  if (sortBy === "memberName") return [{ member: { name: "asc" } }, { dueDate: "asc" }];
  return [{ dueDate: "asc" }, { createdAt: "desc" }];
}

export async function getActionItems(filters: ActionItemFilters = {}) {
  const where: Prisma.ActionItemWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.memberId) where.memberId = filters.memberId;
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = { some: { tagId: { in: filters.tagIds } } };
  }
  if (filters.keyword) {
    where.OR = [
      { title: { contains: filters.keyword } },
      { description: { contains: filters.keyword } },
    ];
  }
  if (filters.dateFilter && filters.dateFilter !== "all") {
    Object.assign(where, buildDateFilter(filters.dateFilter));
  }

  const orderBy = buildOrderBy(filters.sortBy ?? "dueDate");
  const page = Math.max(1, filters.page ?? 1);
  const perPage = filters.perPage ?? 20;
  const skip = (page - 1) * perPage;

  const [items, total] = await Promise.all([
    prisma.actionItem.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        member: { select: { id: true, name: true } },
        meeting: { select: { id: true, date: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.actionItem.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return { items, total, page, perPage, totalPages };
}

export async function getPendingActionItems(memberId: string) {
  return prisma.actionItem.findMany({
    where: { memberId, status: { not: "DONE" } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: { meeting: { select: { id: true, date: true } } },
  });
}

export async function updateActionItemStatus(
  id: string,
  status: string,
): Promise<ActionResult<ActionItem>> {
  return runAction(async () => {
    const { status: validatedStatus } = updateActionItemStatusSchema.parse({ status });
    if (!id) throw new Error("アクションアイテムIDが指定されていません");
    const completedAt = validatedStatus === "DONE" ? new Date() : null;
    const result = await prisma.actionItem.update({
      where: { id },
      data: { status: validatedStatus, completedAt },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function updateActionItem(
  id: string,
  input: UpdateActionItemInput,
): Promise<ActionResult<ActionItem>> {
  return runAction(async () => {
    const validated = updateActionItemSchema.parse(input);
    if (!id) throw new Error("アクションアイテムIDが指定されていません");
    const dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    const result = await prisma.actionItem.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        dueDate,
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function createActionItemForMeeting(
  meetingId: string,
  memberId: string,
  input: UpdateActionItemInput,
): Promise<ActionResult<ActionItem>> {
  return runAction(async () => {
    const validated = updateActionItemSchema.parse(input);
    const existingCount = await prisma.actionItem.count({ where: { meetingId } });
    const dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    const result = await prisma.actionItem.create({
      data: {
        meetingId,
        memberId,
        title: validated.title,
        description: validated.description,
        sortOrder: existingCount,
        dueDate,
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}
