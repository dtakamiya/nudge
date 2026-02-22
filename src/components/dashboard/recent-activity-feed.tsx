import { Activity, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AvatarInitial } from "@/components/ui/avatar-initial";
import { EmptyState } from "@/components/ui/empty-state";
import type { ActivityItem } from "@/lib/actions/dashboard-actions";
import { formatRelativeDate } from "@/lib/format";

type Props = {
  readonly activities: readonly ActivityItem[];
};

function ActivityRow({ activity }: { readonly activity: ActivityItem }) {
  const isMeeting = activity.type === "meeting";
  const date = isMeeting ? activity.date : activity.completedAt;
  const href = isMeeting ? `/members/${activity.memberId}` : `/members/${activity.memberId}`;

  return (
    <Link
      href={href}
      className="flex items-start gap-3 py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors duration-150 group"
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <AvatarInitial name={activity.memberName} size="sm" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full ring-2 ring-card ${
            isMeeting ? "bg-primary text-primary-foreground" : "bg-success text-white"
          }`}
        >
          {isMeeting ? (
            <Calendar className="w-2.5 h-2.5" />
          ) : (
            <CheckCircle2 className="w-2.5 h-2.5" />
          )}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-medium">{activity.memberName}</span>
          {isMeeting ? (
            <span className="text-muted-foreground"> と 1on1 を実施</span>
          ) : (
            <>
              <span className="text-muted-foreground"> が </span>
              <span className="font-medium truncate">&ldquo;{activity.title}&rdquo;</span>
              <span className="text-muted-foreground"> を完了</span>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeDate(date)}</p>
      </div>
    </Link>
  );
}

export function RecentActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return <EmptyState icon={Activity} title="最近のアクティビティはありません" size="compact" />;
  }

  return (
    <div className="divide-y divide-border/50">
      {activities.map((activity) => (
        <ActivityRow key={`${activity.type}-${activity.id}`} activity={activity} />
      ))}
    </div>
  );
}
