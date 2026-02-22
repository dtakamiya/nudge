"use server";

import { prisma } from "@/lib/prisma";
import { toMonthKey } from "@/lib/format";
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
    const monthKey = toMonthKey(date);

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

export type ActionMonthlyTrend = {
  month: string;
  created: number;
  completed: number;
};

export type ActionTrendResult = {
  averageCompletionDays: number;
  onTimeCompletionRate: number;
  monthlyTrends: ActionMonthlyTrend[];
};

export async function getMemberActionTrends(memberId: string): Promise<ActionTrendResult> {
  const actions = await prisma.actionItem.findMany({
    where: { memberId },
    orderBy: { createdAt: "asc" },
  });

  if (actions.length === 0) {
    return {
      averageCompletionDays: 0,
      onTimeCompletionRate: 0,
      monthlyTrends: [],
    };
  }

  // 1. Calculate Average Completion Days
  const completedActions = actions.filter((a) => a.completedAt !== null);
  let totalCompletionMs = 0;
  for (const action of completedActions) {
    const timeToComplete = action.completedAt!.getTime() - action.createdAt.getTime();
    totalCompletionMs += timeToComplete;
  }
  const averageCompletionDays =
    completedActions.length > 0
      ? totalCompletionMs / completedActions.length / (1000 * 60 * 60 * 24)
      : 0;

  // 2. Calculate On-Time Completion Rate
  // Defines total completed as denominator. An item without dueDate is considered "on time".
  let onTimeCount = 0;
  for (const action of completedActions) {
    if (!action.dueDate) {
      onTimeCount++;
    } else if (action.completedAt!.getTime() <= action.dueDate.getTime()) {
      onTimeCount++;
    }
  }
  const onTimeCompletionRate =
    completedActions.length > 0 ? (onTimeCount / completedActions.length) * 100 : 0;

  // 3. Monthly Trends
  const monthlyMap = new Map<string, { created: number; completed: number }>();

  for (const action of actions) {
    // Collect created
    const createdDate = new Date(action.createdAt);
    const createdMonthKey = toMonthKey(createdDate);
    if (!monthlyMap.has(createdMonthKey)) {
      monthlyMap.set(createdMonthKey, { created: 0, completed: 0 });
    }
    monthlyMap.get(createdMonthKey)!.created++;

    // Collect completed
    if (action.completedAt) {
      const completedDate = new Date(action.completedAt);
      const completedMonthKey = toMonthKey(completedDate);
      if (!monthlyMap.has(completedMonthKey)) {
        monthlyMap.set(completedMonthKey, { created: 0, completed: 0 });
      }
      monthlyMap.get(completedMonthKey)!.completed++;
    }
  }

  const monthlyTrends: ActionMonthlyTrend[] = Array.from(monthlyMap.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, counts]) => ({ month, ...counts }));

  return {
    averageCompletionDays,
    onTimeCompletionRate,
    monthlyTrends,
  };
}

export type MeetingFrequencyMonth = {
  month: string;
  count: number;
};

export async function getMeetingFrequencyByMonth(): Promise<MeetingFrequencyMonth[]> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const meetings = await prisma.meeting.findMany({
    where: { date: { gte: twelveMonthsAgo } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, number>();
  for (const meeting of meetings) {
    const d = new Date(meeting.date);
    const key = toMonthKey(d);
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export type RecommendedMeeting = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  daysSinceLast: number;
  lastMeetingDate: Date | null;
};

export async function getRecommendedMeetings(): Promise<RecommendedMeeting[]> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const now = new Date();

  const members = await prisma.member.findMany({
    include: {
      meetings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
  });

  return members
    .filter((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      if (!lastDate) return true;
      return new Date(lastDate) < fourteenDaysAgo;
    })
    .map((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      const daysSinceLast = lastDate
        ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
        : 9999;
      return {
        id: m.id,
        name: m.name,
        department: m.department,
        position: m.position,
        daysSinceLast,
        lastMeetingDate: lastDate ? new Date(lastDate) : null,
      };
    })
    .sort((a, b) => b.daysSinceLast - a.daysSinceLast);
}

export async function getAllMembersWithInterval(): Promise<RecommendedMeeting[]> {
  const now = new Date();

  const members = await prisma.member.findMany({
    include: {
      meetings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return members.map((m) => {
    const lastDate = m.meetings[0]?.date ?? null;
    const daysSinceLast = lastDate
      ? Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    return {
      id: m.id,
      name: m.name,
      department: m.department,
      position: m.position,
      daysSinceLast,
      lastMeetingDate: lastDate ? new Date(lastDate) : null,
    };
  });
}
