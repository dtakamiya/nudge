import { z } from "zod";

export const actionItemStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const updateActionItemStatusSchema = z.object({
  status: actionItemStatus,
});

export type ActionItemStatusType = z.infer<typeof actionItemStatus>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;
