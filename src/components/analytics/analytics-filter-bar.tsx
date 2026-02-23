"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberIntervalSort } from "@/lib/actions/analytics-actions";

type Props = {
  readonly departments: string[];
  readonly currentDepartment: string;
  readonly currentPeriod: 3 | 6 | 12;
  readonly currentSort: MemberIntervalSort;
};

const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: "3", label: "直近3ヶ月" },
  { value: "6", label: "直近6ヶ月" },
  { value: "12", label: "直近12ヶ月" },
];

const SORT_OPTIONS: { value: MemberIntervalSort; label: string }[] = [
  { value: "name", label: "名前順" },
  { value: "last_meeting", label: "最終1on1日順" },
  { value: "department", label: "部署順" },
];

export function AnalyticsFilterBar({
  departments,
  currentDepartment,
  currentPeriod,
  currentSort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/analytics?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
      <span className="text-sm font-medium text-muted-foreground shrink-0">フィルタ:</span>

      {departments.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">部署</span>
          <Select
            value={currentDepartment || "all"}
            onValueChange={(v) => updateParam("department", v)}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="すべての部署" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての部署</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">期間</span>
        <Select value={String(currentPeriod)} onValueChange={(v) => updateParam("period", v)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">並び替え</span>
        <Select value={currentSort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
