import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

type Props = {
  readonly summary: DashboardSummaryType;
};

type SummaryCardProps = {
  readonly title: string;
  readonly value: number;
  readonly unit: string;
  readonly accent?: "destructive" | "success" | "default";
};

function getAccentClasses(accent: SummaryCardProps["accent"]): string {
  switch (accent) {
    case "destructive":
      return "text-[oklch(0.55_0.2_25)]";
    case "success":
      return "text-[oklch(0.45_0.15_155)]";
    default:
      return "text-foreground";
  }
}

function SummaryCard({ title, value, unit, accent = "default" }: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className={`text-2xl font-semibold tracking-tight ${getAccentClasses(accent)}`}>
        {value}
        <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function getFollowUpAccent(count: number): SummaryCardProps["accent"] {
  return count > 0 ? "destructive" : "success";
}

function getCompletionAccent(rate: number): SummaryCardProps["accent"] {
  if (rate >= 80) return "success";
  if (rate >= 50) return "default";
  return "destructive";
}

function getOverdueAccent(count: number): SummaryCardProps["accent"] {
  return count > 0 ? "destructive" : "success";
}

export function DashboardSummary({ summary }: Props) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        title="要フォロー"
        value={summary.needsFollowUp}
        unit="人"
        accent={getFollowUpAccent(summary.needsFollowUp)}
      />
      <SummaryCard
        title="アクション完了率"
        value={summary.actionCompletionRate}
        unit="%"
        accent={getCompletionAccent(summary.actionCompletionRate)}
      />
      <SummaryCard
        title="期限超過"
        value={summary.overdueActions}
        unit="件"
        accent={getOverdueAccent(summary.overdueActions)}
      />
    </div>
  );
}
