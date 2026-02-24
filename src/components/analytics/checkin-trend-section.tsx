import { getCheckinTrend } from "@/lib/actions/analytics-actions";

import { CheckinTrendChart } from "./checkin-trend-chart";

type Props = {
  memberId: string;
};

export async function CheckinTrendSection({ memberId }: Props) {
  const data = await getCheckinTrend(memberId, 12);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="my-8 animate-fade-in-up stagger-4">
      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">
        チェックイン状態の推移
      </h2>
      <CheckinTrendChart data={data} />
    </div>
  );
}
