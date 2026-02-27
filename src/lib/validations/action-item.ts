import { z } from "zod";

export const actionItemStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const actionItemPriority = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const updateActionItemStatusSchema = z.object({
  status: actionItemStatus,
});

export const updateActionItemSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  dueDate: z.string().optional(),
  priority: actionItemPriority.optional().default("MEDIUM"),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string()).min(1, "対象アイテムが選択されていません"),
  status: actionItemStatus,
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "対象アイテムが選択されていません"),
});

export type ActionItemStatusType = z.infer<typeof actionItemStatus>;
export type ActionItemPriorityType = z.infer<typeof actionItemPriority>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;
export type UpdateActionItemInput = z.input<typeof updateActionItemSchema>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
