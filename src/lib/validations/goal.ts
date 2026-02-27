import { z } from "zod";

export const goalStatus = z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const goalProgressMode = z.enum(["MANUAL", "AUTO"]);

export const createGoalSchema = z.object({
  title: z.string().min(1, "目標のタイトルは必須です"),
  description: z.string().default(""),
  progress: z
    .number()
    .int("進捗は整数で入力してください")
    .min(0, "進捗は0以上で入力してください")
    .max(100, "進捗は100以下で入力してください")
    .default(0),
  status: goalStatus.default("IN_PROGRESS"),
  progressMode: goalProgressMode.default("MANUAL"),
  dueDate: z.string().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1, "目標のタイトルは必須です").optional(),
  description: z.string().optional(),
  progress: z
    .number()
    .int("進捗は整数で入力してください")
    .min(0, "進捗は0以上で入力してください")
    .max(100, "進捗は100以下で入力してください")
    .optional(),
  status: goalStatus.optional(),
  progressMode: goalProgressMode.optional(),
  dueDate: z.string().optional(),
});

export const updateGoalProgressSchema = z.object({
  progress: z
    .number()
    .int("進捗は整数で入力してください")
    .min(0, "進捗は0以上で入力してください")
    .max(100, "進捗は100以下で入力してください"),
});

export type GoalStatusType = z.infer<typeof goalStatus>;
export type GoalProgressModeType = z.infer<typeof goalProgressMode>;
export type CreateGoalInput = z.input<typeof createGoalSchema>;
export type UpdateGoalInput = z.input<typeof updateGoalSchema>;
export type UpdateGoalProgressInput = z.input<typeof updateGoalProgressSchema>;
