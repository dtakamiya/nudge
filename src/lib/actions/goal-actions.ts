"use server";

import { revalidatePath } from "next/cache";

import type { Goal, GoalStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validations/goal";
import {
  createGoalSchema,
  updateGoalProgressSchema,
  updateGoalSchema,
} from "@/lib/validations/goal";

import { type ActionResult, runAction } from "./types";

/** メンバーの目標一覧を取得 */
export async function getGoals(memberId: string): Promise<Goal[]> {
  return prisma.goal.findMany({
    where: { memberId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

/** メンバーの進行中目標を取得（準備画面向け） */
export async function getActiveGoals(memberId: string): Promise<Goal[]> {
  return prisma.goal.findMany({
    where: { memberId, status: "IN_PROGRESS" },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });
}

/** 目標を作成 */
export async function createGoal(
  memberId: string,
  input: CreateGoalInput,
): Promise<ActionResult<Goal>> {
  return runAction(async () => {
    if (!memberId) throw new Error("メンバーIDが指定されていません");
    const validated = createGoalSchema.parse(input);
    const dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    const result = await prisma.goal.create({
      data: {
        memberId,
        title: validated.title,
        description: validated.description,
        progress: validated.progress,
        status: validated.status,
        dueDate,
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

/** 目標を更新 */
export async function updateGoal(id: string, input: UpdateGoalInput): Promise<ActionResult<Goal>> {
  return runAction(async () => {
    if (!id) throw new Error("目標IDが指定されていません");
    const validated = updateGoalSchema.parse(input);
    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data.title = validated.title;
    if (validated.description !== undefined) data.description = validated.description;
    if (validated.progress !== undefined) data.progress = validated.progress;
    if (validated.status !== undefined) data.status = validated.status;
    if (validated.dueDate !== undefined) {
      data.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    }
    if (validated.status === "COMPLETED" && validated.progress === undefined) {
      data.progress = 100;
    }
    const result = await prisma.goal.update({ where: { id }, data });
    revalidatePath("/", "layout");
    return result;
  });
}

/** 目標の進捗を更新 */
export async function updateGoalProgress(
  id: string,
  progress: number,
): Promise<ActionResult<Goal>> {
  return runAction(async () => {
    if (!id) throw new Error("目標IDが指定されていません");
    const { progress: validatedProgress } = updateGoalProgressSchema.parse({ progress });
    const data: { progress: number; status?: GoalStatus } = { progress: validatedProgress };
    if (validatedProgress === 100) {
      data.status = "COMPLETED";
    }
    const result = await prisma.goal.update({ where: { id }, data });
    revalidatePath("/", "layout");
    return result;
  });
}

/** 目標を削除 */
export async function deleteGoal(id: string): Promise<ActionResult<Goal>> {
  return runAction(async () => {
    if (!id) throw new Error("目標IDが指定されていません");
    const result = await prisma.goal.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
