import { GoalProgressBar } from "@/components/goal/goal-progress-bar";
import type { Goal } from "@/generated/prisma/client";

type Props = {
  goals: Goal[];
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
          <GoalProgressBar progress={goal.progress} size="sm" />
          {goal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
