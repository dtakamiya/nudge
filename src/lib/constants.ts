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
