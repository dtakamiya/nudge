"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Goal } from "@/generated/prisma/client";
import { deleteGoal, updateGoalProgress } from "@/lib/actions/goal-actions";
import { cn } from "@/lib/utils";

import { GoalProgressBar } from "./goal-progress-bar";

type Props = {
  goal: Goal & { actionItems?: { id: string; status: string }[] };
  onEdit: (goal: Goal) => void;
};

const STATUS_CONFIG = {
  IN_PROGRESS: { label: "進行中", variant: "default" as const },
  COMPLETED: { label: "完了", variant: "secondary" as const },
  CANCELLED: { label: "キャンセル", variant: "outline" as const },
} as const;

function formatDueDate(date: Date | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isOverdue(dueDate: Date | null, status: string): boolean {
  if (!dueDate || status !== "IN_PROGRESS") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function GoalCard({ goal, onEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusConfig = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG];
  const dueDateStr = formatDueDate(goal.dueDate);
  const overdue = isOverdue(goal.dueDate, goal.status);

  function handleProgressChange(value: number[]) {
    startTransition(async () => {
      await updateGoalProgress(goal.id, value[0]);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteGoal(goal.id);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "border rounded-lg p-4 flex flex-col gap-3 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold tracking-tight truncate">{goal.title}</h3>
            <Badge variant={statusConfig.variant} className="shrink-0 text-xs">
              {statusConfig.label}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(goal)}
            aria-label="編集"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDelete}
              >
                削除
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                戻す
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="削除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <GoalProgressBar progress={goal.progress} />
        </div>
        {goal.progressMode === "AUTO" && (
          <span className="text-xs text-muted-foreground shrink-0">(自動)</span>
        )}
      </div>

      {goal.status === "IN_PROGRESS" && goal.progressMode !== "AUTO" && (
        <Slider
          value={[goal.progress]}
          onValueCommit={handleProgressChange}
          min={0}
          max={100}
          step={5}
          className="w-full"
          aria-label="進捗スライダー"
        />
      )}

      {goal.actionItems && goal.actionItems.length > 0 && (
        <p className="text-xs text-muted-foreground">
          アクション {goal.actionItems.filter((a) => a.status === "DONE").length}/
          {goal.actionItems.length} 完了
        </p>
      )}

      {dueDateStr && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs",
            overdue ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>期限: {dueDateStr}</span>
          {overdue && <span className="font-medium">（期限切れ）</span>}
        </div>
      )}
    </div>
  );
}
