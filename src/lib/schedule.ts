/**
 * 定期ミーティングスケジュール計算ユーティリティ
 */

/**
 * 次回推奨ミーティング日を計算する
 * @param lastMeetingDate 最終ミーティング日（null の場合は null を返す）
 * @param intervalDays ミーティング間隔（日数）
 */
export function calcNextRecommendedDate(
  lastMeetingDate: Date | null,
  intervalDays: number,
): Date | null {
  if (!lastMeetingDate) return null;
  const next = new Date(lastMeetingDate);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

/**
 * ミーティングが期限超過かどうかを判定する
 * @param lastMeetingDate 最終ミーティング日（null の場合は未実施 → true）
 * @param intervalDays ミーティング間隔（日数）
 * @param now 現在日時（省略時は new Date()）
 */
export function isOverdue(
  lastMeetingDate: Date | null,
  intervalDays: number,
  now: Date = new Date(),
): boolean {
  if (!lastMeetingDate) return true;
  const next = calcNextRecommendedDate(lastMeetingDate, intervalDays);
  if (!next) return true;
  return now >= next;
}

/**
 * 今日から7日以内に次回推奨日が含まれるかどうかを判定する（「今週予定」判定）
 * @param lastMeetingDate 最終ミーティング日（null の場合は false）
 * @param intervalDays ミーティング間隔（日数）
 * @param now 現在日時（省略時は new Date()）
 */
export function isScheduledThisWeek(
  lastMeetingDate: Date | null,
  intervalDays: number,
  now: Date = new Date(),
): boolean {
  if (!lastMeetingDate) return false;
  const next = calcNextRecommendedDate(lastMeetingDate, intervalDays);
  if (!next) return false;

  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return next >= now && next < weekEnd;
}

/**
 * 次回推奨日を人間が読みやすい文字列にフォーマットする
 * @param nextDate 次回推奨日（null の場合は「未設定」）
 * @param now 現在日時（省略時は new Date()）
 */
export function formatNextRecommendedDate(nextDate: Date | null, now: Date = new Date()): string {
  if (!nextDate) return "未設定";

  const nowDate = new Date(now);
  nowDate.setHours(0, 0, 0, 0);

  const targetDate = new Date(nextDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - nowDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今日";
  if (diffDays < 0) return `${Math.abs(diffDays)}日超過`;
  return `あと${diffDays}日`;
}
