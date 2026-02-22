"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription,CardHeader, CardTitle } from "@/components/ui/card";
import { TopicCategory } from "@/generated/prisma/client";
import { type MonthlyTrend } from "@/lib/actions/analytics-actions";

import { CATEGORY_COLORS,CATEGORY_LABELS } from "./topic-distribution-chart";

type Props = {
  data: MonthlyTrend[];
};

export function TopicTrendChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      // month を整形 (YYYY-MM -> YYYY/MM)
      const formattedMonth = item.month.replace("-", "/");
      return {
        ...item,
        name: formattedMonth,
      };
    });
  }, [data]);

  const categories = Object.keys(CATEGORY_LABELS) as TopicCategory[];

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>話題の時系列推移</CardTitle>
          <CardDescription>月別の各カテゴリの話題数</CardDescription>
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
        <CardTitle>話題の時系列推移</CardTitle>
        <CardDescription>月別の各カテゴリの話題数</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
              formatter={(value: unknown, name: unknown) => {
                const category = categories.find((c) => c === name);
                return [`${String(value)}件`, category ? CATEGORY_LABELS[category] : String(name)];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const category = categories.find((c) => c === value) as TopicCategory | undefined;
                return category ? CATEGORY_LABELS[category] : value;
              }}
            />
            {categories.map((category) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="a"
                fill={CATEGORY_COLORS[category]}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
