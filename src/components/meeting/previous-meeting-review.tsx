"use client";

import { AlertTriangle,CheckCircle2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format";

type CompletedAction = {
  id: string;
  title: string;
  dueDate: Date | null;
};

type PendingAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
};

type LastMeetingData = {
  meetingId: string;
  meetingDate: Date;
  completedActions: CompletedAction[];
  pendingActions: PendingAction[];
};

type Props = {
  data: LastMeetingData | null;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function PreviousMeetingReview({ data, selectedIds, onToggle }: Props) {
  if (!data) {
    return <p className="text-sm text-muted-foreground">前回のミーティング記録がありません</p>;
  }

  const hasCompleted = data.completedActions.length > 0;
  const hasPending = data.pendingActions.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        前回 ({formatDate(data.meetingDate)}) のアクション
      </p>

      {hasCompleted && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">完了済み</p>
          {data.completedActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-2 text-sm text-muted-foreground rounded p-2 bg-muted/30"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="flex-1 truncate line-through">{action.title}</span>
              {action.dueDate && (
                <span className="text-xs shrink-0">{formatDate(action.dueDate)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {hasPending && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            未完了（今回に引き継ぐ項目を選択）
          </p>
          {data.pendingActions.map((action) => {
            const isSelected = selectedIds.has(action.id);
            return (
              <div
                key={action.id}
                className={`flex items-center gap-2 text-sm rounded p-2 cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                }`}
                onClick={() => onToggle(action.id)}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <Checkbox
                  id={`prev-action-${action.id}`}
                  checked={isSelected}
                  onCheckedChange={() => onToggle(action.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${action.title}を今回のフォローアップ対象にする`}
                />
                <span className="flex-1 truncate">{action.title}</span>
                {action.dueDate && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(action.dueDate)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedIds.size > 0 && (
        <p className="text-xs text-primary font-medium">
          {selectedIds.size}件を今回のフォローアップ対象に設定
        </p>
      )}
    </div>
  );
}
