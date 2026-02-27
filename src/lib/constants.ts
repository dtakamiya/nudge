export const MEETINGS_PAGE_SIZE = 10;

export const CATEGORY_LABELS: Record<string, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・相談",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

export const MEETING_INTERVAL_LABELS: Record<number, string> = {
  7: "毎週",
  14: "隔週",
  30: "月1回",
};

export function getMeetingIntervalLabel(days: number): string {
  return MEETING_INTERVAL_LABELS[days] ?? `${days}日間隔`;
}

export const TAG_COLOR_PALETTE = [
  "#6366f1", // インディゴ
  "#8b5cf6", // パープル
  "#ec4899", // ピンク
  "#ef4444", // レッド
  "#f97316", // オレンジ
  "#eab308", // イエロー
  "#22c55e", // グリーン
  "#14b8a6", // ティール
  "#3b82f6", // ブルー
  "#64748b", // スレート
] as const;

export const TAG_NAME_MAX_LENGTH = 30;
export const TAG_NAME_MIN_LENGTH = 1;
export const TAG_SUGGESTIONS_LIMIT = 10;

/** コンディションアラート: チェックに必要な最低ミーティング数 */
export const CONDITION_ALERT_MIN_MEETINGS = 2;
/** コンディションアラート: チェック対象の直近ミーティング数 */
export const CONDITION_ALERT_CHECK_COUNT = 3;
/** コンディションアラート: 気分スコアの低値閾値（5段階中） */
export const MOOD_LOW_THRESHOLD = 2;
/** コンディションアラート: コンディションスコアの低値閾値（5段階中） */
export const CONDITION_LOW_THRESHOLD = 2;

export const NOTE_CATEGORIES = [
  { value: "good", label: "良い点" },
  { value: "improvement", label: "改善点" },
  { value: "notice", label: "気づき" },
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number]["value"];

export function getNoteCategoryLabel(category: string): string {
  const found = NOTE_CATEGORIES.find((c) => c.value === category);
  return found?.label ?? category;
}
