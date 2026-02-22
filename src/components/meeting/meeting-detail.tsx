import { ActionListCompact } from "@/components/action/action-list-compact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getMoodOption } from "@/lib/mood";

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
  date: Date;
  mood?: number | null;
  topics: Topic[];
  actionItems: ActionItem[];
};

export function MeetingDetail({ date, mood, topics, actionItems }: Props) {
  const moodOption = getMoodOption(mood);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <p className="text-lg text-muted-foreground">{formatDate(date)}</p>
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
        />
      </div>
    </div>
  );
}
