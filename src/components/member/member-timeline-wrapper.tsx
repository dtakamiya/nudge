"use client";

import { useMemo, useState } from "react";

import type { MemberTimelineEntry } from "@/lib/types";

import { MemberTimeline } from "./member-timeline";
import { type TimelinePeriod, TimelinePeriodFilter } from "./timeline-period-filter";

type Props = {
  readonly entries: MemberTimelineEntry[];
  readonly memberId: string;
};

function getEntryDate(entry: MemberTimelineEntry): Date {
  if (entry.type === "meeting") return entry.date;
  if (entry.type === "action_completed") return entry.completedAt;
  if (entry.type === "goal_completed") return entry.completedAt;
  return entry.dueDate;
}

function filterByPeriod(
  entries: readonly MemberTimelineEntry[],
  period: TimelinePeriod,
): MemberTimelineEntry[] {
  if (period === "all") return [...entries];
  const now = new Date();
  const days = period === "1month" ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return entries.filter((entry) => getEntryDate(entry) >= cutoff);
}

export function MemberTimelineWrapper({ entries, memberId }: Props) {
  const [period, setPeriod] = useState<TimelinePeriod>("all");

  const filteredEntries = useMemo(() => filterByPeriod(entries, period), [entries, period]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <TimelinePeriodFilter value={period} onChange={setPeriod} />
      </div>
      <MemberTimeline entries={filteredEntries} memberId={memberId} />
    </div>
  );
}
