"use client";

import { Badge } from "@/components/ui/badge";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";

type ActionItemRow = {
  id: string;
  title: string;
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

export function ActionListCompact({ actionItems }: Props) {
  const router = useRouter();
  if (actionItems.length === 0) {
    return <p className="text-muted-foreground py-4">アクションアイテムはありません</p>;
  }
  async function cycleStatus(id: string, currentStatus: string) {
    const next =
      currentStatus === "TODO" ? "IN_PROGRESS" : currentStatus === "IN_PROGRESS" ? "DONE" : "TODO";
    try {
      await updateActionItemStatus(id, next);
      router.refresh();
    } catch {
      // Silently fail - status will remain unchanged in UI
    }
  }
  return (
    <div className="flex flex-col gap-2">
      {actionItems.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            <button onClick={() => cycleStatus(item.id, item.status)}>
              <Badge variant={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
            </button>
            <span className="text-sm">{item.title}</span>
          </div>
          {item.dueDate && (
            <span className="text-xs text-muted-foreground">期限: {formatDate(item.dueDate)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
