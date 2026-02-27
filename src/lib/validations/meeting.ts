import { z } from "zod";

import { actionItemPriority } from "./action-item";

const topicCategory = z.enum(["WORK_PROGRESS", "CAREER", "ISSUES", "FEEDBACK", "OTHER"]);

const topicInputSchema = z.object({
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

const actionItemInputSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  dueDate: z.string().optional(),
  priority: actionItemPriority.optional().default("MEDIUM"),
  goalId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

export const createMeetingSchema = z.object({
  memberId: z.string().min(1, "メンバーIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  conditionHealth: z.number().int().min(1).max(5).nullable().optional(),
  conditionMood: z.number().int().min(1).max(5).nullable().optional(),
  conditionWorkload: z.number().int().min(1).max(5).nullable().optional(),
  checkinNote: z.string().max(500).optional().default(""),
  topics: z.array(topicInputSchema),
  actionItems: z.array(actionItemInputSchema),
});

const updateTopicInputSchema = z.object({
  id: z.string().optional(),
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

const updateActionItemInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  dueDate: z.string().optional(),
  priority: actionItemPriority.optional().default("MEDIUM"),
  goalId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

export const updateMeetingSchema = z.object({
  meetingId: z.string().min(1, "ミーティングIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  conditionHealth: z.number().int().min(1).max(5).nullable().optional(),
  conditionMood: z.number().int().min(1).max(5).nullable().optional(),
  conditionWorkload: z.number().int().min(1).max(5).nullable().optional(),
  checkinNote: z.string().max(500).optional().default(""),
  topics: z.array(updateTopicInputSchema),
  actionItems: z.array(updateActionItemInputSchema),
  deletedTopicIds: z.array(z.string()).default([]),
  deletedActionItemIds: z.array(z.string()).default([]),
});

export type CreateMeetingInput = z.input<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.input<typeof updateMeetingSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
export type ActionItemInput = z.infer<typeof actionItemInputSchema>;

export const startMeetingSchema = z.object({
  meetingId: z.string().min(1, "ミーティングIDは必須です"),
});

export const endMeetingSchema = z.object({
  meetingId: z.string().min(1, "ミーティングIDは必須です"),
});

export const updateTopicNotesSchema = z.object({
  topicId: z.string().min(1, "トピックIDは必須です"),
  notes: z.string().max(10000, "ノートは10000文字以内で入力してください"),
});

export type StartMeetingInput = z.input<typeof startMeetingSchema>;
export type EndMeetingInput = z.input<typeof endMeetingSchema>;
export type UpdateTopicNotesInput = z.input<typeof updateTopicNotesSchema>;
