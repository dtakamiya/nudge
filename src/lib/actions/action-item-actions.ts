"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  updateActionItemStatusSchema,
  updateActionItemSchema,
} from "@/lib/validations/action-item";
import type { ActionItemStatusType, UpdateActionItemInput } from "@/lib/validations/action-item";
import type { Prisma, ActionItem } from "@/generated/prisma/client";
import { runAction, type ActionResult } from "./types";

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
