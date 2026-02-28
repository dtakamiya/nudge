import { Activity, AlertTriangle, Calendar, CheckCircle2, Target } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getMoodOption } from "@/lib/mood";
import type { MemberTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  entries: MemberTimelineEntry[];
  memberId: string;
};

const TIMELINE_THRESHOLD = 5;

function MeetingEntryContent({
  entry,
  memberId,
}: {
  entry: Extract<MemberTimelineEntry, { type: "meeting" }>;
  memberId: string;
}) {
  const mood = getMoodOption(entry.mood);
  return (
    <Link
      href={`/members/${memberId}/meetings/${entry.id}`}
      className="block group rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground group-hover:text-primary">
          {formatDate(entry.date)} の1on1
        </span>
        {mood && <span className="text-lg">{mood.emoji}</span>}
      </div>
      <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
        <span>話題 {entry.topicCount}件</span>
        <span>アクション {entry.actionCount}件</span>
      </div>
    </Link>
  );
}

function ActionCompletedContent({
  entry,
  memberId,
}: {
  entry: Extract<MemberTimelineEntry, { type: "action_completed" }>;
  memberId: string;
}) {
  return (
    <Link
      href={`/members/${memberId}/meetings/${entry.meetingId}`}
      className="block group rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <p className="text-sm font-medium text-foreground group-hover:text-primary">{entry.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">完了日: {formatDate(entry.completedAt)}</p>
    </Link>
  );
}

function ActionOverdueContent({
  entry,
  memberId,
}: {
  entry: Extract<MemberTimelineEntry, { type: "action_overdue" }>;
  memberId: string;
}) {
  return (
    <Link
      href={`/members/${memberId}/meetings/${entry.meetingId}`}
      className="block group rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 hover:bg-destructive/10 transition-colors"
    >
      <p className="text-sm font-medium text-foreground group-hover:text-destructive">
        {entry.title}
      </p>
      <p className="mt-1 text-sm text-destructive/80">期日: {formatDate(entry.dueDate)}</p>
    </Link>
  );
}

function GoalCompletedContent({
  entry,
}: {
  entry: Extract<MemberTimelineEntry, { type: "goal_completed" }>;
}) {
  return (
    <Link
      href={`/members/${entry.memberId}?tab=goals`}
      className="block group rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 hover:bg-purple-100 transition-colors dark:border-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
    >
      <p className="text-sm font-medium text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-400">
        {entry.title}
      </p>
      <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
        達成日: {formatDate(entry.completedAt)}
      </p>
    </Link>
  );
}

const ENTRY_STYLES = {
  meeting: {
    icon: Calendar,
    iconClass: "text-primary bg-primary/10",
  },
  action_completed: {
    icon: CheckCircle2,
    iconClass: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  action_overdue: {
    icon: AlertTriangle,
    iconClass: "text-destructive bg-destructive/10",
  },
  goal_completed: {
    icon: Target,
    iconClass: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
} as const;

export function MemberTimeline({ entries, memberId }: Props) {
  if (entries.length < TIMELINE_THRESHOLD) {
    return (
      <EmptyState
        icon={Activity}
        title="まだ活動の記録がありません"
        description="1on1を記録すると時系列で振り返りができます"
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
      <ul className="space-y-4">
        {entries.map((entry) => {
          const style = ENTRY_STYLES[entry.type];
          const Icon = style.icon;
          return (
            <li key={`${entry.type}-${entry.id}`} className="flex gap-4">
              <div
                className={cn(
                  "relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  style.iconClass,
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                {entry.type === "meeting" && (
                  <MeetingEntryContent entry={entry} memberId={memberId} />
                )}
                {entry.type === "action_completed" && (
                  <ActionCompletedContent entry={entry} memberId={memberId} />
                )}
                {entry.type === "action_overdue" && (
                  <ActionOverdueContent entry={entry} memberId={memberId} />
                )}
                {entry.type === "goal_completed" && <GoalCompletedContent entry={entry} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
