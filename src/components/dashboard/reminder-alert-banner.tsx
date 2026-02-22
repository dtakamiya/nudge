import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { OverdueReminder } from "@/lib/actions/reminder-actions";

type Props = {
  readonly reminders: OverdueReminder[];
};

export function ReminderAlertBanner({ reminders }: Props) {
  if (reminders.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in-up"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-destructive">ミーティングリマインダー</h2>
        <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
          {reminders.length}件
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {reminders.map((reminder) => (
          <li
            key={reminder.memberId}
            className="flex items-center justify-between gap-3 rounded-lg bg-background/60 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-foreground truncate">{reminder.memberName}</span>
              <span className="text-muted-foreground shrink-0">
                {reminder.daysSinceLastMeeting === null
                  ? "未実施"
                  : `${reminder.daysSinceLastMeeting}日経過`}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                （設定: {reminder.meetingIntervalDays}日）
              </span>
            </div>
            <Link
              href={`/members/${reminder.memberId}/meetings/new?prepare=true`}
              className="shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              1on1準備
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
