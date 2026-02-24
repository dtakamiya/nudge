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
import type { ActionMonthlyTrend } from "@/lib/types";

export function ActionCompletionTrendChart({ data }: { data: ActionMonthlyTrend[] }) {
  const mounted = useChartMounted();

  if (!mounted) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">月次完了トレンド</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full pt-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            データがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const parts = val.split("-");
                  return parts.length === 2 ? `${parseInt(parts[1], 10)}月` : val;
                }}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                fontSize={12}
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
                name="完了数"
                type="monotone"
                dataKey="completed"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="作成数"
                type="monotone"
                dataKey="created"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
