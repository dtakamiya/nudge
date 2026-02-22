"use client";

import { useMemo } from "react";
import { Cell, Legend,Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { TopicCategory } from "@/generated/prisma/client";
import { type CategoryTrend } from "@/lib/actions/analytics-actions";

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・悩み",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

export const CATEGORY_COLORS: Record<TopicCategory, string> = {
  WORK_PROGRESS: "hsl(var(--chart-1))",
  CAREER: "hsl(var(--chart-2))",
  ISSUES: "hsl(var(--chart-3))",
  FEEDBACK: "hsl(var(--chart-4))",
  OTHER: "hsl(var(--chart-5))",
};

type Props = {
  data: CategoryTrend[];
};

export function TopicDistributionChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: CATEGORY_LABELS[item.category],
      value: item.count,
      color: CATEGORY_COLORS[item.category],
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>話題カテゴリの分布</CardTitle>
          <CardDescription>これまでの1on1で話された話題の割合</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          データがありません
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>話題カテゴリの分布</CardTitle>
        <CardDescription>これまでの1on1で話された話題の割合</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [`${String(value)}件`, "件数"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
