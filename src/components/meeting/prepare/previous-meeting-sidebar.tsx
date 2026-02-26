"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type Topic = { id: string; category: string; title: string; notes: string };
type ActionItem = { id: string; title: string; status: string; dueDate: Date | null };
type MeetingData = { id: string; date: Date; topics: Topic[]; actionItems: ActionItem[] } | null;
type Props = {
  previousMeeting: MeetingData;
  pendingActions: ActionItem[];
  followUpActionIds?: string[];
};

export function PreviousMeetingSidebar({
  previousMeeting,
  pendingActions,
  followUpActionIds = [],
}: Props) {
  const followUpSet = new Set(followUpActionIds);
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
      const result = await updateActionItemStatus(id, "DONE");
      if (!result.success) {
        console.error("ステータス更新に失敗:", result.error);
      }
      router.refresh();
    });
  }

  const sortedActions = [...optimisticActions].sort((a, b) => {
    const aIsFollowUp = followUpSet.has(a.id) ? 0 : 1;
    const bIsFollowUp = followUpSet.has(b.id) ? 0 : 1;
    return aIsFollowUp - bIsFollowUp;
  });

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
              {sortedActions.map((action) => {
                const isFollowUp = followUpSet.has(action.id);
                return (
                  <div
                    key={action.id}
                    className={`flex items-center gap-2 text-sm rounded p-1 ${
                      action.status === "DONE"
                        ? "line-through text-muted-foreground"
                        : isFollowUp
                          ? "bg-primary/10 border border-primary/20"
                          : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={action.status === "DONE"}
                      onChange={() => markDone(action.id)}
                      className="rounded"
                      aria-label={`${action.title}を完了にする`}
                    />
                    {isFollowUp && action.status !== "DONE" && (
                      <Badge variant="secondary" className="text-xs shrink-0 px-1">
                        引き継ぎ
                      </Badge>
                    )}
                    <span className="flex-1">{action.title}</span>
                    {action.dueDate && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(action.dueDate)}
                      </span>
                    )}
                  </div>
                );
              })}
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
