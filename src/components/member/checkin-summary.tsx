import type { CheckinTrendEntry } from "@/lib/actions/analytics-actions";
import { cn } from "@/lib/utils";

type ScoreLevel = "good" | "warning" | "danger" | "none";

function getScoreLevel(score: number | null): ScoreLevel {
  if (score === null) return "none";
  if (score <= 2) return "danger";
  if (score === 3) return "warning";
  return "good";
}

function getScoreColorClass(level: ScoreLevel): string {
  switch (level) {
    case "good":
      return "bg-emerald-500/80";
    case "warning":
      return "bg-amber-400/80";
    case "danger":
      return "bg-destructive/70";
    case "none":
      return "bg-muted";
  }
}

type ScoreDotProps = {
  score: number | null;
  label: string;
  date: string;
};

function ScoreDot({ score, label, date }: ScoreDotProps) {
  const level = getScoreLevel(score);
  const colorClass = getScoreColorClass(level);
  const scoreText = score !== null ? `${score}/5` : "データなし";

  return (
    <div
      className={cn("w-7 h-7 rounded-full flex items-center justify-center", colorClass)}
      title={`${date} ${label}: ${scoreText}`}
      aria-label={`${date} ${label}: ${scoreText}`}
      data-score-level={level === "none" ? undefined : level}
    >
      {score !== null && (
        <span className="text-[10px] font-medium text-white leading-none">{score}</span>
      )}
    </div>
  );
}

const ROWS = [
  { label: "体調", key: "health" as const },
  { label: "気分", key: "mood" as const },
  { label: "負荷", key: "workload" as const },
] as const;

type Props = {
  data: CheckinTrendEntry[];
};

export function CheckinSummary({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">チェックインデータがありません</p>;
  }

  return (
    <div className="space-y-2">
      {ROWS.map(({ label, key }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 shrink-0">{label}</span>
          <div className="flex gap-1.5 flex-wrap">
            {data.map((entry, i) => (
              <ScoreDot key={i} score={entry[key]} label={label} date={entry.date} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="w-8 shrink-0" />
        <div className="flex gap-1.5">
          {data.map((_, i) => (
            <span key={i} className="text-[10px] text-muted-foreground w-7 text-center">
              {i === 0 && data.length > 1 ? "古" : i === data.length - 1 ? "最新" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
