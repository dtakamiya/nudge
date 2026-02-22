import { getMemberTopicTrends } from "@/lib/actions/analytics-actions";

import { TopicDistributionChart } from "./topic-distribution-chart";
import { TopicTrendChart } from "./topic-trend-chart";

type Props = {
  memberId: string;
};

export async function TopicAnalyticsSection({ memberId }: Props) {
  const { distribution, timeline } = await getMemberTopicTrends(memberId);

  // データが全くない場合はセクション自体を表示しない
  if (distribution.length === 0 && timeline.length === 0) {
    return null;
  }

  return (
    <div className="my-8 animate-fade-in-up stagger-2">
      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">話題の傾向</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopicDistributionChart data={distribution} />
        <TopicTrendChart data={timeline} />
      </div>
    </div>
  );
}
