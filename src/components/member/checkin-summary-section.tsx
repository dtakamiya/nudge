import { getRecentCheckinSummary } from "@/lib/actions/analytics-actions";

import { CheckinSummary } from "./checkin-summary";

type Props = {
  memberId: string;
};

export async function CheckinSummarySection({ memberId }: Props) {
  const data = await getRecentCheckinSummary(memberId, 5);

  return (
    <div className="mt-6 animate-fade-in-up stagger-2">
      <h2 className="text-sm font-semibold tracking-tight mb-3 text-muted-foreground uppercase">
        直近のチェックイン状態
      </h2>
      <CheckinSummary data={data} />
    </div>
  );
}
