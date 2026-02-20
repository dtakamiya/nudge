"use client";

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

  async function markDone(id: string) {
    try {
      await updateActionItemStatus(id, "DONE");
      router.refresh();
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">未完了アクション</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">なし</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" onChange={() => markDone(action.id)} className="rounded" />
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
