import { z } from "zod";

export const actionItemStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const updateActionItemStatusSchema = z.object({
  status: actionItemStatus,
});

export const updateActionItemSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  dueDate: z.string().optional(),
});

export type ActionItemStatusType = z.infer<typeof actionItemStatus>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
