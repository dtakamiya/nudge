import type { TopicCategory } from "@/generated/prisma/client";

/**
 * 気分トレンドエントリ
 */
export type MoodTrendEntry = {
  date: Date;
  mood: number;
};

/**
 * カテゴリ別トレンド
 */
export type CategoryTrend = {
  category: TopicCategory;
  count: number;
};

/**
 * 月別カテゴリトレンド
 */
export type MonthlyTrend = {
  month: string;
  [category: string]: number | string;
};
