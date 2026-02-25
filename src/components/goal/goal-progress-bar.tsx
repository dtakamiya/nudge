type Props = {
  progress: number;
  size?: "sm" | "md";
};

export function GoalProgressBar({ progress, size = "md" }: Props) {
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-muted rounded-full overflow-hidden ${height}`}>
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`進捗 ${clampedProgress}%`}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
        {clampedProgress}%
      </span>
    </div>
  );
}
