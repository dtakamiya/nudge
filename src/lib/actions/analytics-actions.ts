"use server";

import { prisma } from "@/lib/prisma";
import type { TopicCategory } from "@/generated/prisma/client";

export type CategoryTrend = {
  category: TopicCategory;
  count: number;
};

export type MonthlyTrend = {
  month: string;
  [category: string]: number | string; // Category -> count
};

export async function getMemberTopicTrends(memberId: string) {
  const topics = await prisma.topic.findMany({
    where: { meeting: { memberId } },
    include: { meeting: { select: { date: true } } },
    orderBy: { meeting: { date: "asc" } },
  });

  const distributionMap = new Map<TopicCategory, number>();
  const monthlyMap = new Map<string, Record<string, number>>();

  for (const topic of topics) {
    // 1. 分布集計
    distributionMap.set(topic.category, (distributionMap.get(topic.category) || 0) + 1);

    // 2. 時系列集計
    const date = new Date(topic.meeting.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {});
    }
    const monthRecord = monthlyMap.get(monthKey)!;
    monthRecord[topic.category] = (monthRecord[topic.category] || 0) + 1;
  }

  const distribution: CategoryTrend[] = Array.from(distributionMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const timeline: MonthlyTrend[] = Array.from(monthlyMap.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, counts]) => ({ month, ...counts }));

  return { distribution, timeline };
}
