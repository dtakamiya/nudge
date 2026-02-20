import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type TopicSummary = { id: string; category: string; title: string };
type MeetingSummary = {
  id: string;
  date: Date;
  memberId: string;
  topics: TopicSummary[];
  actionItems: { id: string; status: string }[];
};
type Props = { meetings: MeetingSummary[]; memberId: string };

export function MeetingHistory({ meetings, memberId }: Props) {
  if (meetings.length === 0) {
    return <p className="text-muted-foreground py-4">まだ1on1の記録がありません</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {meetings.map((meeting) => {
        const doneCount = meeting.actionItems.filter((a) => a.status === "DONE").length;
        return (
          <Link key={meeting.id} href={`/members/${memberId}/meetings/${meeting.id}`}>
            <Card className="hover:shadow-sm hover:border-[oklch(0.88_0.008_260)] cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{formatDate(meeting.date)}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {meeting.topics.map((topic) => (
                        <Badge key={topic.id} variant="outline" className="text-xs">
                          {CATEGORY_LABELS[topic.category] ?? topic.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    アクション: {doneCount}/{meeting.actionItems.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
