"use server";

import type { TopicCategory } from "@/generated/prisma/client";
import { formatDate, toMonthKey } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { calcNextRecommendedDate, isOverdue, isScheduledThisWeek } from "@/lib/schedule";
import type {
  ActionMonthlyTrend,
  ActionTrendResult,
  CategoryTrend,
  HeatmapData,
  MeetingFrequencyMonth,
  MemberIntervalOptions,
  MemberIntervalSort,
  MemberMeetingHeatmapEntry,
  MonthlyTrend,
  RecommendedMeeting,
  ScheduledMeeting,
} from "@/lib/types";

export type CheckinTrendEntry = {
  date: string;
  health: number | null;
  mood: number | null;
  workload: number | null;
};

export async function getCheckinTrend(memberId: string, limit = 12): Promise<CheckinTrendEntry[]> {
  const meetings = await prisma.meeting.findMany({
    where: {
      memberId,
      OR: [
        { conditionHealth: { not: null } },
        { conditionMood: { not: null } },
        { conditionWorkload: { not: null } },
      ],
    },
    orderBy: { date: "asc" },
    take: limit,
    select: { date: true, conditionHealth: true, conditionMood: true, conditionWorkload: true },
  });

  return meetings.map((m) => ({
    date: formatDate(m.date),
    health: m.conditionHealth,
    mood: m.conditionMood,
    workload: m.conditionWorkload,
  }));
}

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

    const existing = monthlyMap.get(monthKey) ?? {};
    monthlyMap.set(monthKey, {
      ...existing,
      [topic.category]: (existing[topic.category] || 0) + 1,
    });
  }

  const distribution: CategoryTrend[] = Array.from(distributionMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const timeline: MonthlyTrend[] = Array.from(monthlyMap.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, counts]) => ({ month, ...counts }));

  return { distribution, timeline };
}

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
    const existingCreated = monthlyMap.get(createdMonthKey) ?? { created: 0, completed: 0 };
    monthlyMap.set(createdMonthKey, { ...existingCreated, created: existingCreated.created + 1 });

    // Collect completed
    if (action.completedAt) {
      const completedDate = new Date(action.completedAt);
      const completedMonthKey = toMonthKey(completedDate);
      const existingCompleted = monthlyMap.get(completedMonthKey) ?? { created: 0, completed: 0 };
      monthlyMap.set(completedMonthKey, {
        ...existingCompleted,
        completed: existingCompleted.completed + 1,
      });
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

export async function getMeetingFrequencyByMonth(
  monthCount: 3 | 6 | 12 = 12,
  department?: string,
): Promise<MeetingFrequencyMonth[]> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - monthCount, 1);

  const meetings = await prisma.meeting.findMany({
    where: {
      date: { gte: since },
      ...(department ? { member: { department } } : {}),
    },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, number>();
  for (const meeting of meetings) {
    const key = toMonthKey(new Date(meeting.date));
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export async function getDepartments(): Promise<string[]> {
  const rows = await prisma.member.findMany({
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department).filter((d): d is string => d !== null);
}

export async function getRecommendedMeetings(): Promise<RecommendedMeeting[]> {
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
      return isOverdue(lastDate ? new Date(lastDate) : null, m.meetingIntervalDays, now);
    })
    .map((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      const lastDateObj = lastDate ? new Date(lastDate) : null;
      const daysSinceLast = lastDateObj
        ? Math.floor((now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))
        : 9999;
      return {
        id: m.id,
        name: m.name,
        department: m.department,
        position: m.position,
        daysSinceLast,
        lastMeetingDate: lastDateObj,
        meetingIntervalDays: m.meetingIntervalDays,
        nextRecommendedDate: calcNextRecommendedDate(lastDateObj, m.meetingIntervalDays),
      };
    })
    .sort((a, b) => b.daysSinceLast - a.daysSinceLast);
}

export async function getScheduledMeetingsThisWeek(): Promise<ScheduledMeeting[]> {
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
      return isScheduledThisWeek(lastDate ? new Date(lastDate) : null, m.meetingIntervalDays, now);
    })
    .map((m) => {
      const lastDate = new Date(m.meetings[0]!.date);
      const nextRecommendedDate = calcNextRecommendedDate(lastDate, m.meetingIntervalDays)!;
      return {
        id: m.id,
        name: m.name,
        department: m.department,
        position: m.position,
        meetingIntervalDays: m.meetingIntervalDays,
        nextRecommendedDate,
        lastMeetingDate: lastDate,
      };
    })
    .sort((a, b) => a.nextRecommendedDate.getTime() - b.nextRecommendedDate.getTime());
}

export async function getMemberMeetingHeatmap(
  monthCount: 3 | 6 | 12 = 12,
  department?: string,
): Promise<HeatmapData> {
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

  const months: string[] = Array.from({ length: monthCount }, (_, i) =>
    toMonthKey(new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)),
  );

  try {
    const members = await prisma.member.findMany({
      where: department ? { department } : undefined,
      include: {
        meetings: {
          where: { date: { gte: since } },
          select: { date: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const memberEntries: MemberMeetingHeatmapEntry[] = members.map((member) => {
      const countMap = new Map<string, number>();
      for (const meeting of member.meetings) {
        const key = toMonthKey(new Date(meeting.date));
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
      return {
        memberId: member.id,
        memberName: member.name,
        department: member.department,
        months: months.map((month) => ({ month, count: countMap.get(month) ?? 0 })),
      };
    });

    return { members: memberEntries, months };
  } catch (error) {
    console.error("Failed to fetch meeting heatmap:", error);
    return { members: [], months };
  }
}

export async function getAllMembersWithInterval(
  options: MemberIntervalOptions = {},
): Promise<RecommendedMeeting[]> {
  const { department, sort = "name" } = options;
  const now = new Date();

  const members = await prisma.member.findMany({
    where: department ? { department } : undefined,
    include: {
      meetings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const mapped = members.map((m) => {
    const lastDate = m.meetings[0]?.date ?? null;
    const lastDateObj = lastDate ? new Date(lastDate) : null;
    const daysSinceLast = lastDateObj
      ? Math.floor((now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    return {
      id: m.id,
      name: m.name,
      department: m.department,
      position: m.position,
      daysSinceLast,
      lastMeetingDate: lastDateObj,
      meetingIntervalDays: m.meetingIntervalDays,
      nextRecommendedDate: calcNextRecommendedDate(lastDateObj, m.meetingIntervalDays),
    };
  });

  if (sort === "last_meeting") {
    return mapped.sort((a, b) => b.daysSinceLast - a.daysSinceLast);
  }
  if (sort === "department") {
    return mapped.sort((a, b) => {
      const deptA = a.department ?? "";
      const deptB = b.department ?? "";
      if (deptA !== deptB) return deptA.localeCompare(deptB);
      return a.name.localeCompare(b.name);
    });
  }
  // sort === "name" (default, already sorted by DB)
  return mapped;
}

export async function getRecommendedAndScheduledMeetings(): Promise<{
  recommended: RecommendedMeeting[];
  scheduled: ScheduledMeeting[];
}> {
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

  const recommended: RecommendedMeeting[] = members
    .filter((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      return isOverdue(lastDate ? new Date(lastDate) : null, m.meetingIntervalDays, now);
    })
    .map((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      const lastDateObj = lastDate ? new Date(lastDate) : null;
      const daysSinceLast = lastDateObj
        ? Math.floor((now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))
        : 9999;
      return {
        id: m.id,
        name: m.name,
        department: m.department,
        position: m.position,
        daysSinceLast,
        lastMeetingDate: lastDateObj,
        meetingIntervalDays: m.meetingIntervalDays,
        nextRecommendedDate: calcNextRecommendedDate(lastDateObj, m.meetingIntervalDays),
      };
    })
    .sort((a, b) => b.daysSinceLast - a.daysSinceLast);

  const scheduled: ScheduledMeeting[] = members
    .filter((m) => {
      const lastDate = m.meetings[0]?.date ?? null;
      return isScheduledThisWeek(lastDate ? new Date(lastDate) : null, m.meetingIntervalDays, now);
    })
    .flatMap((m) => {
      const meetingDate = m.meetings[0]?.date;
      if (!meetingDate) return [];
      const lastDate = new Date(meetingDate);
      const nextRecommendedDate = calcNextRecommendedDate(lastDate, m.meetingIntervalDays);
      if (!nextRecommendedDate) return [];
      return [
        {
          id: m.id,
          name: m.name,
          department: m.department,
          position: m.position,
          meetingIntervalDays: m.meetingIntervalDays,
          nextRecommendedDate,
          lastMeetingDate: lastDate,
        },
      ];
    })
    .sort((a, b) => a.nextRecommendedDate.getTime() - b.nextRecommendedDate.getTime());

  return { recommended, scheduled };
}
