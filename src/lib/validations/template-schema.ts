import { z } from "zod";

const topicCategory = z.enum(["WORK_PROGRESS", "CAREER", "ISSUES", "FEEDBACK", "OTHER"]);

export const templateTopicSchema = z.object({
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です").max(200, "200文字以内で入力してください"),
});

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名は必須です")
    .max(100, "テンプレート名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").default(""),
  topics: z.array(templateTopicSchema).default([]),
});

export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名は必須です")
    .max(100, "テンプレート名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").default(""),
  topics: z.array(templateTopicSchema).default([]),
});

export type CreateTemplateInput = z.input<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.input<typeof updateTemplateSchema>;
export type TemplateTopicInput = z.infer<typeof templateTopicSchema>;

// エクスポート/インポート用スキーマ
export const templateExportItemSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名は必須です")
    .max(100, "テンプレート名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").default(""),
  topics: z.array(templateTopicSchema).default([]),
});

export const templateExportFileSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  templates: z.array(templateExportItemSchema).min(1, "テンプレートが含まれていません"),
});

export type TemplateExportItem = z.infer<typeof templateExportItemSchema>;
export type TemplateExportFile = z.infer<typeof templateExportFileSchema>;
