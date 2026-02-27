import { z } from "zod";

export const noteCategory = z.enum(["good", "improvement", "notice"]);

export const createMemberNoteSchema = z.object({
  memberId: z.string().uuid("メンバーIDが不正です"),
  content: z
    .string()
    .min(1, "内容を入力してください")
    .max(2000, "内容は2000文字以内で入力してください"),
  category: noteCategory,
});

export const updateMemberNoteSchema = z.object({
  content: z
    .string()
    .min(1, "内容を入力してください")
    .max(2000, "内容は2000文字以内で入力してください"),
  category: noteCategory,
});

export type CreateMemberNoteInput = z.infer<typeof createMemberNoteSchema>;
export type UpdateMemberNoteInput = z.infer<typeof updateMemberNoteSchema>;
