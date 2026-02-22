"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapData } from "@/lib/actions/analytics-actions";

type Props = {
  readonly data: HeatmapData;
};

const HEATMAP_LEVELS = [
  { min: 0, max: 0, label: "0回", className: "bg-muted" },
  { min: 1, max: 1, label: "1回", className: "bg-primary/20" },
  { min: 2, max: 2, label: "2回", className: "bg-primary/40" },
  { min: 3, max: 3, label: "3回", className: "bg-primary/60" },
  { min: 4, max: Infinity, label: "4回以上", className: "bg-primary/80" },
] as const;

function getHeatmapCellClass(count: number): string {
  const level = HEATMAP_LEVELS.find((l) => count >= l.min && count <= l.max);
  return level?.className ?? "bg-muted";
}

function formatMonthLabel(monthKey: string): string {
  const parts = monthKey.split("-");
  return parts.length === 2 ? `${parseInt(parts[1], 10)}月` : monthKey;
}

function formatCellLabel(memberName: string, month: string, count: number): string {
  return `${memberName} - ${month}: ${count}回`;
}

export function MeetingHeatmap({ data }: Props) {
  const { members, months } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          メンバー別 ミーティング頻度（直近12ヶ月）
        </CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            データがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="w-full text-xs border-separate border-spacing-1"
              aria-label="メンバー別ミーティング頻度ヒートマップ"
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left font-medium text-muted-foreground pr-3 min-w-[120px]"
                  >
                    メンバー
                  </th>
                  {months.map((month) => (
                    <th
                      key={month}
                      scope="col"
                      className="text-center font-medium text-muted-foreground min-w-[36px]"
                    >
                      {formatMonthLabel(month)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId}>
                    <th
                      scope="row"
                      className="pr-3 py-1 text-sm font-medium text-left truncate max-w-[160px]"
                    >
                      {member.memberName}
                    </th>
                    {member.months.map(({ month, count }) => (
                      <td
                        key={month}
                        className={`rounded-sm h-7 w-9 text-center align-middle transition-colors ${getHeatmapCellClass(count)}`}
                        aria-label={formatCellLabel(member.memberName, month, count)}
                        title={formatCellLabel(member.memberName, month, count)}
                      >
                        {count > 0 && (
                          <span className="text-[10px] font-medium text-foreground/70">
                            {count}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 凡例 */}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span>少</span>
              {HEATMAP_LEVELS.map(({ label, className }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`h-4 w-4 rounded-sm ${className}`} aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
              <span>多</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
