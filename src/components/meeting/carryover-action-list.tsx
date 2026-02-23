"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

type CarryoverAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
};

type Props = {
  meetingDate: Date;
  actions: CarryoverAction[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "IN_PROGRESS") {
    return (
      <Badge variant="default" className="text-xs shrink-0">
        進行中
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs shrink-0">
      未着手
    </Badge>
  );
}

export function CarryoverActionList({ meetingDate, actions, selectedIds, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        前回 ({formatDate(meetingDate)}) の未完了アクション
      </p>
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const isSelected = selectedIds.has(action.id);
          return (
            <div
              key={action.id}
              className={`flex items-center gap-2 text-sm rounded p-2 cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
              }`}
              onClick={() => onToggle(action.id)}
            >
              <input
                type="checkbox"
                id={`carryover-${action.id}`}
                checked={isSelected}
                onChange={() => onToggle(action.id)}
                className="rounded"
                aria-label={`${action.title}を今回のフォローアップ対象にする`}
                onClick={(e) => e.stopPropagation()}
              />
              <StatusBadge status={action.status} />
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
      {selectedIds.size > 0 && (
        <p className="text-xs text-primary font-medium">
          {selectedIds.size}件を今回のフォローアップ対象に設定
        </p>
      )}
    </div>
  );
}
