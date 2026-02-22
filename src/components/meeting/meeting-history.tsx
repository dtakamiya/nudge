import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
type PaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};
type Props = {
  meetings: MeetingSummary[];
  memberId: string;
  pagination: PaginationProps;
};

export function MeetingHistory({ meetings, memberId, pagination }: Props) {
  if (meetings.length === 0 && pagination.page === 1) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="まだ1on1の記録がありません"
        description="最初の1on1を記録して、継続的なフォローアップを始めましょう"
        action={{ label: "1on1を記録する", href: `/members/${memberId}/meetings/new` }}
      />
    );
  }

  const { page, total, pageSize, hasNext, hasPrev } = pagination;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div>
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

      {total > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {total}件中 {start}〜{end}件
          </p>
          <div className="flex gap-2">
            <Link href={`/members/${memberId}?page=${page - 1}`} aria-disabled={!hasPrev}>
              <Button variant="outline" size="sm" disabled={!hasPrev}>
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
            </Link>
            <Link href={`/members/${memberId}?page=${page + 1}`} aria-disabled={!hasNext}>
              <Button variant="outline" size="sm" disabled={!hasNext}>
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
