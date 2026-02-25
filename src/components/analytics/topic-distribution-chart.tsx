"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicCategory } from "@/generated/prisma/client";
import { useChartMounted } from "@/hooks/use-chart-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { CategoryTrend } from "@/lib/types";

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・悩み",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

export const CATEGORY_COLORS: Record<TopicCategory, string> = {
  WORK_PROGRESS: "var(--chart-1)",
  CAREER: "var(--chart-2)",
  ISSUES: "var(--chart-3)",
  FEEDBACK: "var(--chart-4)",
  OTHER: "var(--chart-5)",
};

type Props = {
  data: CategoryTrend[];
};

export function TopicDistributionChart({ data }: Props) {
  const mounted = useChartMounted();
  const prefersReducedMotion = useReducedMotion();
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: CATEGORY_LABELS[item.category],
      value: item.count,
      color: CATEGORY_COLORS[item.category],
    }));
  }, [data]);

  if (!mounted) return null;

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
        {/* スクリーンリーダー向け代替テキスト */}
        <div className="sr-only">
          <p>話題カテゴリの分布（合計 {data.reduce((sum, d) => sum + d.count, 0)} 件）</p>
          <table>
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>件数</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.category}>
                  <td>{CATEGORY_LABELS[d.category]}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* チャート本体（視覚ユーザー向け） */}
        <div aria-hidden="true" className="absolute inset-0" data-testid="pie-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={!prefersReducedMotion}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [`${String(value)}件`, "件数"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
