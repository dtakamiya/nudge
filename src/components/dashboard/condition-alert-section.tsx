import { AlertTriangle, TrendingDown } from "lucide-react";
import Link from "next/link";

import type { ConditionAlert, ConditionAlertMember } from "@/lib/types";

type Props = {
  readonly members: readonly ConditionAlertMember[];
};

function AlertBadge({ alert }: { readonly alert: ConditionAlert }) {
  const trendLabel = alert.trend === "low" ? "低値" : "低下傾向";
  const trendClass =
    alert.trend === "low"
      ? "bg-destructive/10 text-foreground border-destructive/30"
      : "bg-warning/10 text-foreground border-warning/30";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${trendClass}`}
    >
      <TrendingDown className="h-3 w-3" aria-hidden="true" />
      {alert.label}
      <span className="text-[10px]">({trendLabel})</span>
    </span>
  );
}

export function ConditionAlertSection({ members }: Props) {
  if (members.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 animate-fade-in-up"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-warning">要注目メンバー</h2>
        <span className="ml-auto rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-foreground border border-warning/30">
          {members.length}人
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li
            key={member.memberId}
            className="flex items-center justify-between gap-3 rounded-lg bg-background/60 px-3 py-2.5 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link
                href={`/members/${member.memberId}`}
                className="font-medium text-foreground truncate hover:underline shrink-0"
              >
                {member.memberName}
              </Link>
              <div className="flex flex-wrap gap-1.5">
                {member.alerts.map((alert) => (
                  <AlertBadge key={alert.type} alert={alert} />
                ))}
              </div>
            </div>
            <Link
              href={`/members/${member.memberId}/meetings/new?prepare=true`}
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
