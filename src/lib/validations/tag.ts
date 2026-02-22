import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "タグ名は1文字以上入力してください")
    .max(30, "タグ名は30文字以内で入力してください"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "カラーコードは#で始まる6桁の16進数で入力してください")
    .optional(),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1).max(30).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
