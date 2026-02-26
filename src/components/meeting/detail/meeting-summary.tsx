import { calculateConditionDiff, formatConditionDiff } from "@/lib/condition-diff";
import { formatDateLong } from "@/lib/format";

import { ConditionBar } from "../checkin/condition-bar";

export interface MeetingSummaryProps {
  date: string;
  conditionHealth: number | null;
  conditionMood: number | null;
  conditionWorkload: number | null;
  checkinNote: string;
  topicCount: number;
  actionItemCount: number;
  topicTitles?: string[];
  actionItemTitles?: string[];
  showWarnings?: boolean;
  previousConditionHealth?: number | null;
  previousConditionMood?: number | null;
  previousConditionWorkload?: number | null;
}

const DIFF_STYLE: Record<"up" | "same" | "down", string> = {
  up: "text-emerald-600",
  same: "text-slate-500",
  down: "text-rose-600",
};

function ConditionDiffBadge({
  current,
  previous,
}: {
  current: number | null;
  previous: number | null | undefined;
}) {
  const diffResult = calculateConditionDiff(current, previous ?? null);
  const diffText = formatConditionDiff(diffResult);
  if (!diffText || !diffResult) return null;
  return (
    <span className={`text-xs font-medium ${DIFF_STYLE[diffResult.direction]}`}>{diffText}</span>
  );
}

export function MeetingSummary({
  date,
  conditionHealth,
  conditionMood,
  conditionWorkload,
  checkinNote,
  topicCount,
  actionItemCount,
  topicTitles,
  actionItemTitles,
  showWarnings = true,
  previousConditionHealth,
  previousConditionMood,
  previousConditionWorkload,
}: MeetingSummaryProps) {
  const hasAnyCondition =
    conditionHealth !== null || conditionMood !== null || conditionWorkload !== null;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground min-w-[4rem]">日付</span>
        <span className="font-medium">{formatDateLong(date)}</span>
      </div>

      {hasAnyCondition && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">コンディション</span>
          <div className="flex flex-col gap-1 pl-2">
            {conditionHealth !== null && (
              <div className="flex items-center gap-2">
                <span>体調🏥:</span>
                <ConditionBar value={conditionHealth} />
                <ConditionDiffBadge current={conditionHealth} previous={previousConditionHealth} />
              </div>
            )}
            {conditionMood !== null && (
              <div className="flex items-center gap-2">
                <span>気分💭:</span>
                <ConditionBar value={conditionMood} />
                <ConditionDiffBadge current={conditionMood} previous={previousConditionMood} />
              </div>
            )}
            {conditionWorkload !== null && (
              <div className="flex items-center gap-2">
                <span>業務量📊:</span>
                <ConditionBar value={conditionWorkload} />
                <ConditionDiffBadge
                  current={conditionWorkload}
                  previous={previousConditionWorkload}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {checkinNote && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">チェックインメモ</span>
          <p className="pl-2 text-sm">{checkinNote}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[4rem]">話題</span>
          <span className="font-medium">{topicCount}件</span>
        </div>
        {topicTitles && topicTitles.length > 0 && (
          <ul className="flex flex-col gap-0.5 pl-[4.5rem]">
            {topicTitles.map((title, i) => (
              <li key={i} className="flex gap-1 text-muted-foreground">
                <span>・</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[4rem]">アクション</span>
          <span className="font-medium">{actionItemCount}件</span>
        </div>
        {actionItemTitles && actionItemTitles.length > 0 && (
          <ul className="flex flex-col gap-0.5 pl-[4.5rem]">
            {actionItemTitles.map((title, i) => (
              <li key={i} className="flex gap-1 text-muted-foreground">
                <span>・</span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showWarnings && actionItemCount === 0 && (
        <div className="flex items-center gap-1 rounded-md bg-amber-50 px-3 py-2 text-amber-700">
          <span>⚠️</span>
          <span>アクションアイテムが設定されていません</span>
        </div>
      )}
    </div>
  );
}
