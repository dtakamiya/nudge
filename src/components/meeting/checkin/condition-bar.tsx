export const MAX_CONDITION = 5;

type Props = {
  value: number;
  label?: string;
};

export function ConditionBar({ value, label }: Props) {
  const clamped = Math.max(0, Math.min(MAX_CONDITION, value));
  const filled = "\u25CF".repeat(clamped);
  const empty = "\u25CB".repeat(MAX_CONDITION - clamped);
  return (
    <span
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={MAX_CONDITION}
      aria-label={label}
      className="font-mono text-sm"
    >
      {filled}
      {empty}（{clamped}/{MAX_CONDITION}）
    </span>
  );
}
