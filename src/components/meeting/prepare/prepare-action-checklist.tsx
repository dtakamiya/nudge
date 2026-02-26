"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { formatDate } from "@/lib/format";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type PendingAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  pendingActions: PendingAction[];
};

const STATUS_CYCLE: Record<string, string> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export function PrepareActionChecklist({ pendingActions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActions, setOptimisticActions] = useOptimistic(
    pendingActions,
    (currentActions, { id, status }: { id: string; status: string }) =>
      currentActions.map((action) => (action.id === id ? { ...action, status } : action)),
  );

  function handleToggle(action: PendingAction) {
    const nextStatus = STATUS_CYCLE[action.status] ?? "IN_PROGRESS";
    startTransition(async () => {
      setOptimisticActions({ id: action.id, status: nextStatus });
      const result = await updateActionItemStatus(
        action.id,
        nextStatus as "TODO" | "IN_PROGRESS" | "DONE",
      );
      if (result.success) {
        toast.success(TOAST_MESSAGES.actionItem.statusChangeSuccess);
      } else {
        toast.error(TOAST_MESSAGES.actionItem.statusChangeError);
      }
      router.refresh();
    });
  }

  if (pendingActions.length === 0) {
    return <p className="text-sm text-muted-foreground">未完了のアクションはありません</p>;
  }

  return (
    <div className={`flex flex-col gap-2 ${isPending ? "opacity-70" : ""}`}>
      {optimisticActions.map((action) => (
        <div
          key={action.id}
          className={`flex items-center gap-2 text-sm ${action.status === "DONE" ? "line-through text-muted-foreground" : ""}`}
        >
          <input
            type="checkbox"
            checked={action.status === "DONE"}
            onChange={() => handleToggle(action)}
            className="rounded"
            aria-label={`${action.title}のステータスを更新`}
          />
          <Badge
            variant={action.status === "IN_PROGRESS" ? "default" : "outline"}
            className="text-xs shrink-0"
          >
            {action.status === "IN_PROGRESS"
              ? "進行中"
              : action.status === "DONE"
                ? "完了"
                : "未着手"}
          </Badge>
          <span className="flex-1 truncate">{action.title}</span>
          {action.dueDate && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDate(action.dueDate)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
