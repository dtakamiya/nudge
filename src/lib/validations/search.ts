import { z } from "zod";

export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "検索クエリは必須です")
    .max(100, "検索クエリは100文字以内で入力してください"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
