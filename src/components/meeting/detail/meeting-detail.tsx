import { ActionListCompact } from "@/components/action/action-list-compact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatDuration } from "@/lib/format";
import { getMoodOption } from "@/lib/mood";

import { ConditionBar } from "../checkin/condition-bar";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

type ActionItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  meetingId: string;
  memberId: string;
  date: Date;
  mood?: number | null;
  conditionHealth?: number | null;
  conditionMood?: number | null;
  conditionWorkload?: number | null;
  checkinNote?: string | null;
  topics: Topic[];
  actionItems: ActionItem[];
  startedAt?: Date | null;
  endedAt?: Date | null;
};

export function MeetingDetail({
  meetingId,
  memberId,
  date,
  mood,
  conditionHealth,
  conditionMood,
  conditionWorkload,
  checkinNote,
  topics,
  actionItems,
  startedAt,
  endedAt,
}: Props) {
  const moodOption = getMoodOption(mood);
  const hasAnyCondition =
    conditionHealth != null || conditionMood != null || conditionWorkload != null;
  const hasDuration = startedAt != null && endedAt != null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <p className="text-lg text-slate-600">{formatDate(date)}</p>
        {hasDuration && (
          <span className="text-sm text-muted-foreground">
            ({formatDuration(startedAt, endedAt)})
          </span>
        )}
        {moodOption && (
          <span
            className="text-xl"
            title={moodOption.label}
            aria-label={`雰囲気: ${moodOption.label}`}
          >
            {moodOption.emoji}
          </span>
        )}
      </div>

      {(hasAnyCondition || checkinNote) && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">チェックイン</h2>
          {hasAnyCondition && (
            <div className="flex flex-col gap-1 text-sm">
              {conditionHealth != null && (
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">体調🏥:</span>
                  <ConditionBar value={conditionHealth} />
                </div>
              )}
              {conditionMood != null && (
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">気分💭:</span>
                  <ConditionBar value={conditionMood} />
                </div>
              )}
              {conditionWorkload != null && (
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">業務量📊:</span>
                  <ConditionBar value={conditionWorkload} />
                </div>
              )}
            </div>
          )}
          {checkinNote && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">チェックインメモ</p>
              <p className="text-sm whitespace-pre-wrap">{checkinNote}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">話題</h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">話題なし</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[topic.category] ?? topic.category}
                    </Badge>
                    <span className="font-medium">{topic.title}</span>
                  </div>
                  {topic.notes && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {topic.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Separator />
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">アクションアイテム</h2>
        <ActionListCompact
          actionItems={actionItems.map((a) => ({
            ...a,
            meeting: { date: a.meeting.date },
          }))}
          meetingId={meetingId}
          memberId={memberId}
          enableBulkSelect
        />
      </div>
    </div>
  );
}
