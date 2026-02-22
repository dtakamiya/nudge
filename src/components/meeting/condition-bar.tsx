export const MAX_CONDITION = 5;

export function ConditionBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(MAX_CONDITION, value));
  const filled = "\u25CF".repeat(clamped);
  const empty = "\u25CB".repeat(MAX_CONDITION - clamped);
  return (
    <span className="font-mono text-sm">
      {filled}
      {empty}（{clamped}/{MAX_CONDITION}）
    </span>
  );
}
