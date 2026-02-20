import { z } from "zod";

const topicCategory = z.enum([
  "WORK_PROGRESS",
  "CAREER",
  "ISSUES",
  "FEEDBACK",
  "OTHER",
]);

const topicInputSchema = z.object({
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
});

const actionItemInputSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  dueDate: z.string().optional(),
});

export const createMeetingSchema = z.object({
  memberId: z.string().min(1, "メンバーIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  topics: z.array(topicInputSchema),
  actionItems: z.array(actionItemInputSchema),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
export type ActionItemInput = z.infer<typeof actionItemInputSchema>;
