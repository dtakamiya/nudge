"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type Topic = { id: string; category: string; title: string; notes: string };
type ActionItem = { id: string; title: string; status: string; dueDate: Date | null };
type MeetingData = { id: string; date: Date; topics: Topic[]; actionItems: ActionItem[] } | null;
type Props = { previousMeeting: MeetingData; pendingActions: ActionItem[] };

export function PreviousMeetingSidebar({ previousMeeting, pendingActions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticActions, setOptimisticActions] = useOptimistic(
    pendingActions,
    (currentActions, { id }: { id: string }) =>
      currentActions.map((action) => (action.id === id ? { ...action, status: "DONE" } : action)),
  );

  function markDone(id: string) {
    startTransition(async () => {
      setOptimisticActions({ id });
      try {
        await updateActionItemStatus(id, "DONE");
        router.refresh();
      } catch {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">未完了アクション</CardTitle>
        </CardHeader>
        <CardContent>
          {optimisticActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">なし</p>
          ) : (
            <div className={`flex flex-col gap-2 ${isPending ? "opacity-80" : ""}`}>
              {optimisticActions.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-center gap-2 text-sm ${action.status === "DONE" ? "line-through text-muted-foreground" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={action.status === "DONE"}
                    onChange={() => markDone(action.id)}
                    className="rounded"
                    aria-label={`${action.title}を完了にする`}
                  />
                  <span>{action.title}</span>
                  {action.dueDate && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(action.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {previousMeeting ? `前回: ${formatDate(previousMeeting.date)}` : "前回の記録"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!previousMeeting ? (
            <p className="text-sm text-muted-foreground">前回の記録はありません</p>
          ) : (
            <div className="flex flex-col gap-3">
              {previousMeeting.topics.map((topic) => (
                <div key={topic.id}>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[topic.category] ?? topic.category}
                    </Badge>
                    <span className="text-sm font-medium">{topic.title}</span>
                  </div>
                  {topic.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{topic.notes}</p>
                  )}
                </div>
              ))}
              {previousMeeting.topics.length === 0 && (
                <p className="text-sm text-muted-foreground">話題なし</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
