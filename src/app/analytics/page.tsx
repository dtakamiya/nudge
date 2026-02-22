import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  getMeetingFrequencyByMonth,
  getAllMembersWithInterval,
} from "@/lib/actions/analytics-actions";
import { MeetingFrequencyChart } from "@/components/analytics/meeting-frequency-chart";
import { MeetingIntervalTable } from "@/components/analytics/meeting-interval-table";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [frequencyData, allMembers] = await Promise.all([
    getMeetingFrequencyByMonth(),
    getAllMembersWithInterval(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "ミーティング分析" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">
        ミーティング分析
      </h1>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          月次実施回数（直近12ヶ月）
        </h2>
        <MeetingFrequencyChart data={frequencyData} />
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          メンバー別 最終1on1 経過日数
        </h2>
        <MeetingIntervalTable data={allMembers} />
      </div>
    </div>
  );
}
