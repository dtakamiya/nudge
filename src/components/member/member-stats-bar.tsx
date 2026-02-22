import { Calendar, CalendarClock, CircleAlert, TrendingUp } from "lucide-react";

import { formatDaysElapsed } from "@/lib/format";
import { calcNextRecommendedDate, formatNextRecommendedDate, isOverdue } from "@/lib/schedule";

type Variant = "success" | "warning" | "danger" | "info";

type Props = {
  readonly lastMeetingDate: Date | null;
  readonly totalMeetingCount: number;
  readonly pendingActionCount: number;
  readonly meetingIntervalDays: number;
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

type StatCardProps = {
  readonly title: string;
  readonly displayValue: string;
  readonly unit?: string;
  readonly numericValue?: number;
  readonly variant: Variant;
  readonly icon: React.ReactNode;
};

function StatCard({ title, displayValue, unit, numericValue, variant, icon }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-l-4 ${getBorderClass(variant)} bg-card p-5`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <span className={`${getValueClass(variant)} opacity-70`}>{icon}</span>
      </div>
      {numericValue !== undefined ? (
        <p className={`text-3xl font-bold tracking-tight ${getValueClass(variant)}`}>
          {numericValue}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
      ) : (
        <p className={`text-xl font-bold tracking-tight ${getValueClass(variant)}`}>
          {displayValue}
        </p>
      )}
    </div>
  );
}

function getLastMeetingVariant(date: Date | null): Variant {
  if (!date) return "info";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return "success";
  if (diffDays < 14) return "warning";
  return "danger";
}

function getPendingVariant(count: number): Variant {
  if (count === 0) return "success";
  if (count <= 3) return "warning";
  return "danger";
}

function getNextMeetingVariant(nextDate: Date | null, intervalDays: number): Variant {
  if (!nextDate) return "info";
  const now = new Date();
  if (isOverdue(null, intervalDays, now)) return "info"; // null case handled above
  const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return "danger";
  if (daysUntil <= 3) return "warning";
  return "info";
}

export function MemberStatsBar({
  lastMeetingDate,
  totalMeetingCount,
  pendingActionCount,
  meetingIntervalDays,
}: Props) {
  const lastMeetingVariant = getLastMeetingVariant(lastMeetingDate);
  const nextRecommendedDate = calcNextRecommendedDate(lastMeetingDate, meetingIntervalDays);
  const nextMeetingVariant = getNextMeetingVariant(nextRecommendedDate, meetingIntervalDays);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="最終1on1"
        displayValue={formatDaysElapsed(lastMeetingDate)}
        variant={lastMeetingVariant}
        icon={<Calendar className="w-5 h-5" />}
      />
      <StatCard
        title="次回推奨日"
        displayValue={formatNextRecommendedDate(nextRecommendedDate)}
        variant={nextMeetingVariant}
        icon={<CalendarClock className="w-5 h-5" />}
      />
      <StatCard
        title="通算1on1"
        displayValue={`${totalMeetingCount}回`}
        numericValue={totalMeetingCount}
        unit="回"
        variant="info"
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <StatCard
        title="未完了アクション"
        displayValue={`${pendingActionCount}件`}
        numericValue={pendingActionCount}
        unit="件"
        variant={getPendingVariant(pendingActionCount)}
        icon={<CircleAlert className="w-5 h-5" />}
      />
    </div>
  );
}
