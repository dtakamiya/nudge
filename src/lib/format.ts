export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ja-JP");
}

export function formatDaysElapsed(date: Date | string | null): string {
  if (!date) return "未実施";

  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "今日";
  if (diffDays < 14) return `${diffDays}日経過`;
  if (diffDays < 31) return `${Math.floor(diffDays / 7)}週間経過`;
  return "1ヶ月以上経過";
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "未実施";

  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "今日";
  if (diffDays < 14) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return "1ヶ月以上前";
}

export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
