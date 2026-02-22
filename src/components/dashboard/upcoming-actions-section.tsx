import Link from "next/link";
import { CalendarCheck, Clock, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import type { ActionItemWithMember } from "@/lib/actions/dashboard-actions";
import { formatDate } from "@/lib/format";

type Props = {
  readonly today: readonly ActionItemWithMember[];
  readonly thisWeek: readonly ActionItemWithMember[];
};

function ActionRow({
  item,
  isOverdue,
}: {
  readonly item: ActionItemWithMember;
  readonly isOverdue?: boolean;
}) {
  return (
    <Link
      href={`/members/${item.memberId}`}
      className="flex items-center gap-2 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors duration-150 group"
    >
      <span
        className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
          isOverdue
            ? "bg-destructive"
            : item.status === "IN_PROGRESS"
              ? "bg-warning"
              : "bg-muted-foreground/50"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">{item.memberName}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatDate(item.dueDate)}
      </span>
    </Link>
  );
}

export function UpcomingActionsSection({ today, thisWeek }: Props) {
  const hasAny = today.length > 0 || thisWeek.length > 0;

  if (!hasAny) {
    return (
      <EmptyState icon={CalendarCheck} title="今週の期限アクションはありません" size="compact" />
    );
  }

  return (
    <div className="space-y-4">
      {today.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-medium text-destructive uppercase tracking-wider">
              今日期限
            </span>
            <Badge className="bg-destructive/10 text-destructive text-xs py-0 px-1.5">
              {today.length}
            </Badge>
          </div>
          <div className="space-y-0.5">
            {today.map((item) => (
              <ActionRow key={item.id} item={item} isOverdue />
            ))}
          </div>
        </div>
      )}

      {thisWeek.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              今週期限
            </span>
            <Badge className="bg-muted text-muted-foreground text-xs py-0 px-1.5">
              {thisWeek.length}
            </Badge>
          </div>
          <div className="space-y-0.5">
            {thisWeek.map((item) => (
              <ActionRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
