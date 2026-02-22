import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getMeetingIntervalLabel } from "@/lib/constants";
import type { ScheduledMeeting } from "@/lib/actions/analytics-actions";

type Props = {
  meetings: ScheduledMeeting[];
};

function formatScheduledDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = dayLabels[date.getDay()];
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}（${dayOfWeek}）`;

  if (diffDays === 0) return `今日 · ${dateStr}`;
  if (diffDays === 1) return `明日 · ${dateStr}`;
  return dateStr;
}

export function ScheduledMeetingsSection({ meetings }: Props) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="今週予定の1on1はありません"
        description="メンバーのミーティング間隔を設定すると、今週の予定が表示されます"
        size="compact"
      />
    );
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => {
        const target = new Date(
          meeting.nextRecommendedDate.getFullYear(),
          meeting.nextRecommendedDate.getMonth(),
          meeting.nextRecommendedDate.getDate(),
        );
        const isToday = target.getTime() === today.getTime();
        const isPast = target < today;

        return (
          <div
            key={meeting.id}
            className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <AvatarInitial name={meeting.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{meeting.name}</p>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {getMeetingIntervalLabel(meeting.meetingIntervalDays)}
                </span>
                {isToday && (
                  <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                    今日
                  </span>
                )}
                {isPast && !isToday && (
                  <span className="text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-medium shrink-0">
                    要対応
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatScheduledDate(meeting.nextRecommendedDate)}
              </p>
            </div>
            <Link href={`/members/${meeting.id}/meetings/prepare`}>
              <Button size="sm" variant="outline" className="text-xs h-7">
                1on1準備
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
