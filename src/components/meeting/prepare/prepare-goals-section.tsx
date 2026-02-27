import { GoalProgressBar } from "@/components/goal/goal-progress-bar";
import type { GoalWithActionItems } from "@/lib/actions/goal-actions";

type Props = {
  goals: GoalWithActionItems[];
};

export function PrepareGoalsSection({ goals }: Props) {
  if (goals.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {goals.map((goal) => (
        <div key={goal.id} className="flex flex-col gap-1 p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{goal.title}</span>
            {goal.dueDate && (
              <span className="text-xs text-muted-foreground">
                期限:{" "}
                {new Date(goal.dueDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <GoalProgressBar progress={goal.progress} size="sm" />
            </div>
            {goal.progressMode === "AUTO" && (
              <span className="text-xs text-muted-foreground shrink-0">(自動)</span>
            )}
          </div>
          {goal.actionItems && goal.actionItems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              アクション {goal.actionItems.filter((a) => a.status === "DONE").length}/
              {goal.actionItems.length} 完了
            </p>
          )}
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
