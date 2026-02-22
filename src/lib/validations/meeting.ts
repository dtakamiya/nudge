import { z } from "zod";

const topicCategory = z.enum(["WORK_PROGRESS", "CAREER", "ISSUES", "FEEDBACK", "OTHER"]);

const topicInputSchema = z.object({
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
});

const actionItemInputSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  dueDate: z.string().optional(),
});

export const createMeetingSchema = z.object({
  memberId: z.string().min(1, "メンバーIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  topics: z.array(topicInputSchema),
  actionItems: z.array(actionItemInputSchema),
});

const updateTopicInputSchema = z.object({
  id: z.string().optional(),
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
});

const updateActionItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  dueDate: z.string().optional(),
});

export const updateMeetingSchema = z.object({
  meetingId: z.string().min(1, "ミーティングIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  topics: z.array(updateTopicInputSchema),
  actionItems: z.array(updateActionItemInputSchema),
  deletedTopicIds: z.array(z.string()).default([]),
  deletedActionItemIds: z.array(z.string()).default([]),
  startedAt: z.string().nullable().optional(),
  endedAt: z.string().nullable().optional(),
});

export const updateTopicNoteSchema = z.object({
  topicId: z.string().min(1, "話題IDは必須です"),
  notes: z.string(),
});

export type CreateMeetingInput = z.input<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.input<typeof updateMeetingSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
export type ActionItemInput = z.infer<typeof actionItemInputSchema>;
export type UpdateTopicNoteInput = z.infer<typeof updateTopicNoteSchema>;
