import { getMemberActionTrends } from "@/lib/actions/analytics-actions";

import { ActionCompletionTrendChart } from "./action-completion-trend-chart";
import { ActionKpiCards } from "./action-kpi-cards";

type Props = {
  memberId: string;
};

export async function ActionAnalyticsSection({ memberId }: Props) {
  const { averageCompletionDays, onTimeCompletionRate, monthlyTrends } =
    await getMemberActionTrends(memberId);

  if (monthlyTrends.length === 0) {
    return null;
  }

  return (
    <div className="my-8 animate-fade-in-up stagger-3">
      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">
        アクションアイテムの傾向
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ActionCompletionTrendChart data={monthlyTrends} />
        </div>
        <div className="lg:col-span-1">
          <ActionKpiCards onTimeRate={onTimeCompletionRate} averageDays={averageCompletionDays} />
        </div>
      </div>
    </div>
  );
}
