import { Calendar, CircleAlert, CircleCheck, TrendingUp } from "lucide-react";

import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

type Props = {
  readonly summary: DashboardSummaryType;
};

type Variant = "success" | "warning" | "danger" | "info";

type KPICardProps = {
  readonly title: string;
  readonly value: number;
  readonly unit: string;
  readonly variant: Variant;
  readonly icon: React.ReactNode;
  readonly testId: string;
  readonly staggerClass: string;
};

function getBorderClass(variant: Variant): string {
  switch (variant) {
    case "success":
      return "border-l-success";
    case "warning":
      return "border-l-warning";
    case "danger":
      return "border-l-destructive";
    case "info":
      return "border-l-primary";
  }
}

function getValueClass(variant: Variant): string {
  switch (variant) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-destructive";
    case "info":
      return "text-primary";
  }
}

function KPICard({ title, value, unit, variant, icon, testId, staggerClass }: KPICardProps) {
  return (
    <div
      data-testid={testId}
      className={`animate-fade-in-up ${staggerClass} rounded-xl border border-l-4 ${getBorderClass(variant)} bg-card p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <span className={`${getValueClass(variant)} opacity-70`}>{icon}</span>
      </div>
      <p className={`text-4xl font-bold tracking-tight ${getValueClass(variant)}`}>
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function getFollowUpVariant(count: number): Variant {
  if (count === 0) return "success";
  if (count <= 2) return "warning";
  return "danger";
}

function getCompletionVariant(rate: number): Variant {
  if (rate >= 80) return "success";
  if (rate >= 50) return "warning";
  return "danger";
}

function getOverdueVariant(count: number): Variant {
  return count === 0 ? "success" : "danger";
}

export function DashboardSummary({ summary }: Props) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        testId="kpi-card-follow-up"
        title="要フォロー"
        value={summary.needsFollowUp}
        unit="人"
        variant={getFollowUpVariant(summary.needsFollowUp)}
        icon={<CircleAlert className="w-5 h-5" />}
        staggerClass="stagger-1"
      />
      <KPICard
        testId="kpi-card-completion"
        title="アクション完了率"
        value={summary.actionCompletionRate}
        unit="%"
        variant={getCompletionVariant(summary.actionCompletionRate)}
        icon={<TrendingUp className="w-5 h-5" />}
        staggerClass="stagger-2"
      />
      <KPICard
        testId="kpi-card-meetings"
        title="今月の1on1"
        value={summary.meetingsThisMonth}
        unit="回"
        variant="info"
        icon={<Calendar className="w-5 h-5" />}
        staggerClass="stagger-3"
      />
      <KPICard
        testId="kpi-card-overdue"
        title="期限超過"
        value={summary.overdueActions}
        unit="件"
        variant={getOverdueVariant(summary.overdueActions)}
        icon={<CircleCheck className="w-5 h-5" />}
        staggerClass="stagger-4"
      />
    </div>
  );
}
