"use client";

import { useOptimistic, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ActionItemEditDialog } from "@/components/action/action-item-edit-dialog";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { formatDate } from "@/lib/format";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import { useRouter } from "next/navigation";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};
type Props = { actionItems: ActionItemRow[] };

const statusLabels: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};
const statusColors: Record<string, "status-done" | "status-progress" | "status-todo"> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-progress",
  DONE: "status-done",
};

function nextStatus(current: string): string {
  return current === "TODO" ? "IN_PROGRESS" : current === "IN_PROGRESS" ? "DONE" : "TODO";
}

export function ActionListCompact({ actionItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    actionItems,
    (currentItems, { id, status }: { id: string; status: string }) =>
      currentItems.map((item) => (item.id === id ? { ...item, status } : item)),
  );

  if (actionItems.length === 0) {
    return <p className="text-muted-foreground py-4">アクションアイテムはありません</p>;
  }

  function cycleStatus(id: string, currentStatus: string) {
    const next = nextStatus(currentStatus);
    startTransition(async () => {
      setOptimisticItems({ id, status: next });
      const result = await updateActionItemStatus(id, next);
      if (!result.success) {
        toast.error(TOAST_MESSAGES.actionItem.statusChangeError);
      }
      router.refresh();
    });
  }

  return (
    <div className={`flex flex-col gap-2 ${isPending ? "opacity-80" : ""}`}>
      {optimisticItems.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <button onClick={() => cycleStatus(item.id, item.status)}>
              <Badge variant={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
            </button>
            <span className="text-sm">{item.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {item.dueDate && (
              <span className="text-xs text-muted-foreground">
                期限: {formatDate(item.dueDate)}
              </span>
            )}
            <ActionItemEditDialog
              actionItem={{
                id: item.id,
                title: item.title,
                description: item.description,
                status: item.status as "TODO" | "IN_PROGRESS" | "DONE",
                dueDate: item.dueDate,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
