import { z } from "zod";

export const actionItemStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const updateActionItemStatusSchema = z.object({
  status: actionItemStatus,
});

export const updateActionItemSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください")
    .optional(),
  description: z.string().optional(),
  status: actionItemStatus.optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD形式で入力してください")
    .nullable()
    .optional(),
});

export type ActionItemStatusType = z.infer<typeof actionItemStatus>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
