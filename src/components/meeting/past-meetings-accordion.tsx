"use client";

import { CalendarDays, Copy } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type Topic = { id: string; category: string; title: string; notes: string };
type MeetingData = { id: string; date: Date; topics: Topic[]; actionItems: unknown[] };

type Props = {
  meetings: MeetingData[];
  onCopyTopic: (topic: Topic) => void;
};

export function PastMeetingsAccordion({ meetings, onCopyTopic }: Props) {
  if (meetings.length === 0) {
    return (
      <EmptyState icon={CalendarDays} title="過去のミーティング記録はありません" size="compact" />
    );
  }

  return (
    <AccordionRoot type="multiple" defaultValue={[meetings[0]?.id ?? ""]}>
      {meetings.map((meeting) => (
        <AccordionItem key={meeting.id} value={meeting.id}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span>{formatDate(meeting.date)}</span>
              <Badge variant="outline" className="text-xs">
                {meeting.topics.length}件
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {meeting.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">話題なし</p>
            ) : (
              <div className="flex flex-col gap-2">
                {meeting.topics.map((topic) => (
                  <div key={topic.id} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {CATEGORY_LABELS[topic.category] ?? topic.category}
                        </Badge>
                        <span className="text-sm font-medium truncate">{topic.title}</span>
                      </div>
                      {topic.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{topic.notes}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 shrink-0"
                      onClick={() => onCopyTopic(topic)}
                      aria-label={`${topic.title}をコピー`}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      コピー
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
}
