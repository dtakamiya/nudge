/**
 * コンディション低下を検出する純粋関数。
 *
 * @param values 直近のスコア配列（最新が先頭）。null は未記録を示す。
 * @param lowThreshold この値以下のスコアを「低値」と判定する閾値
 * @returns "low"（最新値が閾値以下）、"declining"（連続低下）、または null（問題なし）
 */
export function detectConditionDecline(
  values: (number | null)[],
  lowThreshold: number,
): "declining" | "low" | null {
  const valid = values.filter((v): v is number => v !== null);

  if (valid.length < 2) return null;

  if (valid[0] <= lowThreshold) return "low";

  const isDeclining = valid.slice(0, -1).every((v, i) => v < valid[i + 1]);
  if (isDeclining) return "declining";

  return null;
}
