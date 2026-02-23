import { Suspense } from "react";

import { AnalyticsFilterBar } from "@/components/analytics/analytics-filter-bar";
import { MeetingFrequencyChart } from "@/components/analytics/meeting-frequency-chart";
import { MeetingHeatmap } from "@/components/analytics/meeting-heatmap";
import { MeetingIntervalTable } from "@/components/analytics/meeting-interval-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  getAllMembersWithInterval,
  getDepartments,
  getMeetingFrequencyByMonth,
  getMemberMeetingHeatmap,
  type MemberIntervalSort,
} from "@/lib/actions/analytics-actions";

export const dynamic = "force-dynamic";

const VALID_PERIODS = [3, 6, 12] as const;
const VALID_SORTS: MemberIntervalSort[] = ["name", "last_meeting", "department"];

function parsePeriod(value: string | undefined): 3 | 6 | 12 {
  const n = Number(value);
  return (VALID_PERIODS as readonly number[]).includes(n) ? (n as 3 | 6 | 12) : 12;
}

function parseSort(value: string | undefined): MemberIntervalSort {
  return VALID_SORTS.includes(value as MemberIntervalSort) ? (value as MemberIntervalSort) : "name";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; period?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const department = params.department ?? "";
  const period = parsePeriod(params.period);
  const sort = parseSort(params.sort);

  const [frequencyData, heatmapData, allMembers, departments] = await Promise.all([
    getMeetingFrequencyByMonth(period, department || undefined),
    getMemberMeetingHeatmap(period, department || undefined),
    getAllMembersWithInterval({ department: department || undefined, sort }),
    getDepartments(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "ミーティング分析" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">
        ミーティング分析
      </h1>

      <Suspense>
        <AnalyticsFilterBar
          departments={departments}
          currentDepartment={department}
          currentPeriod={period}
          currentSort={sort}
        />
      </Suspense>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          月次実施回数（直近{period}ヶ月）
        </h2>
        <MeetingFrequencyChart data={frequencyData} />
      </div>

      <div className="mb-8">
        <MeetingHeatmap data={heatmapData} />
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
