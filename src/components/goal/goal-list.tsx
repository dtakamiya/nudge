"use client";

import { Plus, Target } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Goal } from "@/generated/prisma/client";

import { GoalCard } from "./goal-card";
import { GoalFormDialog } from "./goal-form-dialog";

type FilterValue = "all" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "COMPLETED", label: "完了" },
  { value: "CANCELLED", label: "キャンセル" },
];

type Props = {
  goals: Goal[];
  memberId: string;
};

export function GoalList({ goals, memberId }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const filteredGoals = filter === "all" ? goals : goals.filter((g) => g.status === filter);

  function handleEdit(goal: Goal) {
    setEditingGoal(goal);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingGoal(null);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingGoal(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          目標を追加
        </Button>
      </div>

      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? "目標がありません" : "該当する目標がありません"}
          description={
            goals.length === 0
              ? "「目標を追加」ボタンからメンバーの成長目標を設定しましょう。"
              : "フィルター条件を変更してください。"
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <GoalFormDialog
        memberId={memberId}
        goal={editingGoal}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
