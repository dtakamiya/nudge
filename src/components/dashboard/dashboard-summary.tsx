import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Calendar, Clock } from "lucide-react";
import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

type Props = {
  readonly summary: DashboardSummaryType;
};

type SummaryCardProps = {
  readonly title: string;
  readonly value: number;
  readonly unit: string;
  readonly icon: React.ReactNode;
  readonly colorClass: string;
};

function SummaryCard({ title, value, unit, icon, colorClass }: SummaryCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-3 p-4 pt-0">
        <div className={`rounded-xl p-2.5 ${colorClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getFollowUpColor(count: number): string {
  return count > 0 ? "bg-[#C27549]/10 text-[#C27549]" : "bg-[#6B8F71]/10 text-[#6B8F71]";
}

function getCompletionColor(rate: number): string {
  if (rate >= 80) return "bg-[#6B8F71]/10 text-[#6B8F71]";
  if (rate >= 50) return "bg-[oklch(0.65_0.17_70)]/10 text-[oklch(0.65_0.17_70)]";
  return "bg-[#C27549]/10 text-[#C27549]";
}

function getOverdueColor(count: number): string {
  return count > 0 ? "bg-[#C27549]/10 text-[#C27549]" : "bg-[#6B8F71]/10 text-[#6B8F71]";
}

export function DashboardSummary({ summary }: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard
        title="要フォロー"
        value={summary.needsFollowUp}
        unit="人"
        icon={<AlertTriangle className="size-5" />}
        colorClass={getFollowUpColor(summary.needsFollowUp)}
      />
      <SummaryCard
        title="アクション完了率"
        value={summary.actionCompletionRate}
        unit="%"
        icon={<CheckCircle className="size-5" />}
        colorClass={getCompletionColor(summary.actionCompletionRate)}
      />
      <SummaryCard
        title="今月の1on1"
        value={summary.meetingsThisMonth}
        unit="回"
        icon={<Calendar className="size-5" />}
        colorClass="bg-[oklch(0.65_0.17_70)]/10 text-[oklch(0.65_0.17_70)]"
      />
      <SummaryCard
        title="期限超過"
        value={summary.overdueActions}
        unit="件"
        icon={<Clock className="size-5" />}
        colorClass={getOverdueColor(summary.overdueActions)}
      />
    </div>
  );
}
