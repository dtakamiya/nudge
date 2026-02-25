"use client";

import { BarChart2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useChartMounted } from "@/hooks/use-chart-mounted";
import type { MeetingFrequencyMonth } from "@/lib/types";

export function MeetingFrequencyChart({ data }: { data: MeetingFrequencyMonth[] }) {
  const mounted = useChartMounted();

  if (!mounted) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">月次1on1実施回数</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] w-full pt-4">
        {data.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="まだデータがありません"
            description="1on1を実施すると月次グラフが表示されます。まずはメンバーとの1on1を記録しましょう"
            size="compact"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                tickFormatter={(val: string) => {
                  const parts = val.split("-");
                  return parts.length === 2 ? `${parseInt(parts[1], 10)}月` : val;
                }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
                formatter={(value: number | undefined) => [value ?? 0, "実施回数"]}
              />
              <Bar dataKey="count" name="実施回数" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
