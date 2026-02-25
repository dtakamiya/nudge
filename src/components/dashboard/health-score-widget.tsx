import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import type { HealthScoreData, MemberHealthStatusItem } from "@/lib/actions/dashboard-actions";
import type { MemberHealthStatus } from "@/lib/schedule";

type Props = {
  readonly data: HealthScoreData;
};

type ScoreVariant = "success" | "warning" | "danger";

function getScoreVariant(score: number): ScoreVariant {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

function getScoreColorClass(variant: ScoreVariant): string {
  switch (variant) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-destructive";
  }
}

function getScoreBorderClass(variant: ScoreVariant): string {
  switch (variant) {
    case "success":
      return "border-l-success";
    case "warning":
      return "border-l-warning";
    case "danger":
      return "border-l-destructive";
  }
}

type StatusConfig = {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
};

function getStatusConfig(status: MemberHealthStatus): StatusConfig {
  switch (status) {
    case "healthy":
      return {
        label: "健全",
        icon: <CheckCircle2 className="w-4 h-4 text-success" />,
        badgeClass: "bg-success/10 text-success border-success/30",
      };
    case "warning":
      return {
        label: "注意",
        icon: <AlertTriangle className="w-4 h-4 text-warning" />,
        badgeClass: "bg-warning/10 text-warning border-warning/30",
      };
    case "danger":
      return {
        label: "危険",
        icon: <XCircle className="w-4 h-4 text-destructive" />,
        badgeClass: "bg-destructive/10 text-destructive border-destructive/30",
      };
  }
}

type MemberRowProps = {
  readonly member: MemberHealthStatusItem;
};

function MemberRow({ member }: MemberRowProps) {
  const config = getStatusConfig(member.status);
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span aria-hidden="true">{config.icon}</span>
        <span className="text-sm text-foreground truncate">{member.name}</span>
      </div>
      <span
        aria-label={`ステータス: ${config.label}`}
        className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${config.badgeClass}`}
      >
        {config.label}
      </span>
    </div>
  );
}

type CountBadgeProps = {
  readonly count: number;
  readonly label: string;
  readonly colorClass: string;
  readonly bgClass: string;
  readonly icon: React.ReactNode;
};

function CountBadge({ count, label, colorClass, bgClass, icon }: CountBadgeProps) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${bgClass}`}>
      <span aria-hidden="true">{icon}</span>
      <span className={`text-lg font-bold ${colorClass}`}>{count}</span>
      <span className={`text-xs ${colorClass} opacity-80`}>{label}</span>
    </div>
  );
}

export function HealthScoreWidget({ data }: Props) {
  const { score, healthyCount, warningCount, dangerCount, memberStatuses } = data;
  const variant = getScoreVariant(score);
  const scoreColor = getScoreColorClass(variant);
  const borderColor = getScoreBorderClass(variant);

  return (
    <div
      className={`animate-fade-in-up stagger-1 rounded-xl border border-l-4 ${borderColor} bg-card p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            1on1 健全性スコア
          </p>
          <div className="flex items-baseline gap-1">
            <span
              data-testid="health-score-value"
              className={`text-4xl font-bold tracking-tight ${scoreColor}`}
            >
              {score}
            </span>
            <span className="text-sm font-normal text-muted-foreground">%</span>
          </div>
        </div>

        <div className="flex gap-2">
          <CountBadge
            count={healthyCount}
            label="健全"
            colorClass="text-success"
            bgClass="bg-success/10"
            icon={<CheckCircle2 className="w-4 h-4 text-success" />}
          />
          <CountBadge
            count={warningCount}
            label="注意"
            colorClass="text-warning"
            bgClass="bg-warning/10"
            icon={<AlertTriangle className="w-4 h-4 text-warning" />}
          />
          <CountBadge
            count={dangerCount}
            label="危険"
            colorClass="text-destructive"
            bgClass="bg-destructive/10"
            icon={<XCircle className="w-4 h-4 text-destructive" />}
          />
        </div>
      </div>

      {memberStatuses.length > 0 && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {memberStatuses.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      )}

      {memberStatuses.length === 0 && (
        <p className="text-sm text-muted-foreground">メンバーが登録されていません</p>
      )}
    </div>
  );
}
