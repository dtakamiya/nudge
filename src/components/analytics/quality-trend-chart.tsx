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
import type { QualityTrendEntry } from "@/lib/actions/analytics-actions";

const MIN_DATA_POINTS = 3;

export function QualityTrendChart({ data }: { data: QualityTrendEntry[] }) {
  const mounted = useChartMounted();
  const prefersReducedMotion = useReducedMotion();

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">品質スコアの推移</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] w-full pt-4">
          <div className="h-full w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">品質スコアの推移</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] w-full pt-4">
        {data.length < MIN_DATA_POINTS ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            グラフを表示するには3回以上の品質評価が必要です
          </div>
        ) : (
          <>
            <div className="sr-only">
              <p>品質スコアの推移（{data.length} 回分）</p>
              <table>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>満足度</th>
                    <th>有用度</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d) => (
                    <tr key={d.date}>
                      <td>{d.date}</td>
                      <td>{d.quality}</td>
                      <td>{d.usefulness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                    name="満足度"
                    type="monotone"
                    dataKey="quality"
                    stroke="oklch(0.65 0.2 145)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    isAnimationActive={!prefersReducedMotion}
                  />
                  <Line
                    name="有用度"
                    type="monotone"
                    dataKey="usefulness"
                    stroke="oklch(0.55 0.2 280)"
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
