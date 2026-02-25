"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChartMounted } from "@/hooks/use-chart-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { CheckinTrendEntry } from "@/lib/actions/analytics-actions";

const MIN_DATA_POINTS = 3;

export function CheckinTrendChart({ data }: { data: CheckinTrendEntry[] }) {
  const mounted = useChartMounted();
  const prefersReducedMotion = useReducedMotion();

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">チェックイン状態の推移</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] w-full pt-4">
        {data.length < MIN_DATA_POINTS ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            グラフを表示するには3回以上のチェックインが必要です
          </div>
        ) : (
          <>
            {/* スクリーンリーダー向け代替テキスト */}
            <div className="sr-only">
              <p>チェックイン状態の推移（{data.length} 回分）</p>
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>健康</th>
                    <th>気分</th>
                    <th>業務負荷</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d) => (
                    <tr key={d.date}>
                      <td>{d.date}</td>
                      <td>{d.health}</td>
                      <td>{d.mood}</td>
                      <td>{d.workload}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* チャート本体（視覚ユーザー向け） */}
            <div aria-hidden="true" className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={260}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--muted)", strokeWidth: 2 }}
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Line
                    name="健康"
                    type="monotone"
                    dataKey="health"
                    stroke="oklch(0.60 0.2 25)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    isAnimationActive={!prefersReducedMotion}
                  />
                  <Line
                    name="気分"
                    type="monotone"
                    dataKey="mood"
                    stroke="oklch(0.72 0.15 85)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    isAnimationActive={!prefersReducedMotion}
                  />
                  <Line
                    name="業務負荷"
                    type="monotone"
                    dataKey="workload"
                    stroke="oklch(0.55 0.2 240)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
