export type ConditionDiffResult = {
  diff: number;
  direction: "up" | "same" | "down";
} | null;

export function calculateConditionDiff(
  current: number | null,
  previous: number | null,
): ConditionDiffResult {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "same";
  return { diff, direction };
}

export function formatConditionDiff(result: ConditionDiffResult): string | null {
  if (result === null) return null;
  if (result.direction === "up") return `↑ 前回より+${result.diff}`;
  if (result.direction === "down") return `↓ 前回より${result.diff}`;
  return "─ 前回と同じ";
}
