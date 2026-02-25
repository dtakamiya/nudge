"use server";

import { detectConditionDecline } from "@/lib/condition-alert";
import {
  CONDITION_ALERT_CHECK_COUNT,
  CONDITION_ALERT_MIN_MEETINGS,
  CONDITION_LOW_THRESHOLD,
  MOOD_LOW_THRESHOLD,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getMemberHealthStatus, isOverdue, type MemberHealthStatus } from "@/lib/schedule";
import type {
  ActionActivityItem,
  ActionItemWithMember,
  ActivityItem,
  ConditionAlert,
  ConditionAlertMember,
  ConditionAlertType,
  DashboardSummary,
  MeetingActivityItem,
  UpcomingActionsData,
} from "@/lib/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [members, actionCounts, meetingsThisMonth, overdueActions] = await Promise.all([
    prisma.member.findMany({
      include: {
        meetings: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    }),
    prisma.actionItem.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.meeting.count({
      where: { date: { gte: firstOfMonth } },
    }),
    prisma.actionItem.count({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
    }),
  ]);

  const needsFollowUp = members.filter((m) => {
    const lastDate = m.meetings[0]?.date ?? null;
    return isOverdue(lastDate ? new Date(lastDate) : null, m.meetingIntervalDays, now);
  }).length;

  const totalActions = actionCounts.reduce((sum, g) => sum + g._count.id, 0);
  const completedActions = actionCounts.find((g) => g.status === "DONE")?._count.id ?? 0;
  const actionCompletionRate =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return {
    needsFollowUp,
    actionCompletionRate,
    totalActions,
    completedActions,
    meetingsThisMonth,
    overdueActions,
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const [recentMeetings, recentCompletedActions] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: { date: "desc" },
      take: 5,
      select: {
        id: true,
        date: true,
        member: { select: { id: true, name: true } },
      },
    }),
    prisma.actionItem.findMany({
      where: { status: "DONE", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        completedAt: true,
        member: { select: { id: true, name: true } },
      },
    }),
  ]);

  const meetingItems: MeetingActivityItem[] = recentMeetings.map((m) => ({
    type: "meeting",
    id: m.id,
    memberId: m.member.id,
    memberName: m.member.name,
    date: m.date,
  }));

  const actionItems: ActionActivityItem[] = recentCompletedActions
    .filter((a) => a.completedAt !== null)
    .map((a) => ({
      type: "action",
      id: a.id,
      memberId: a.member.id,
      memberName: a.member.name,
      title: a.title,
      completedAt: a.completedAt as Date,
    }));

  const merged = [...meetingItems, ...actionItems].sort((x, y) => {
    const dateX = x.type === "meeting" ? x.date : x.completedAt;
    const dateY = y.type === "meeting" ? y.date : y.completedAt;
    return new Date(dateY).getTime() - new Date(dateX).getTime();
  });

  return merged.slice(0, 8);
}

export type MemberHealthStatusItem = {
  id: string;
  name: string;
  status: MemberHealthStatus;
  overdueDays: number;
};

export type HealthScoreData = {
  score: number;
  healthyCount: number;
  warningCount: number;
  dangerCount: number;
  memberStatuses: MemberHealthStatusItem[];
};

export async function getHealthScore(): Promise<HealthScoreData> {
  const now = new Date();

  const members = await prisma.member.findMany({
    select: {
      id: true,
      name: true,
      meetingIntervalDays: true,
      meetings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
    orderBy: { name: "asc" },
  });

  if (members.length === 0) {
    return { score: 100, healthyCount: 0, warningCount: 0, dangerCount: 0, memberStatuses: [] };
  }

  const memberStatuses: MemberHealthStatusItem[] = members.map((m) => {
    const lastDate = m.meetings[0]?.date ? new Date(m.meetings[0].date) : null;
    const status = getMemberHealthStatus(lastDate, m.meetingIntervalDays, now);
    const overdueDays =
      lastDate !== null
        ? Math.max(
            0,
            Math.floor(
              (now.getTime() -
                new Date(
                  lastDate.getTime() + m.meetingIntervalDays * 24 * 60 * 60 * 1000,
                ).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;
    return { id: m.id, name: m.name, status, overdueDays };
  });

  const healthyCount = memberStatuses.filter((s) => s.status === "healthy").length;
  const warningCount = memberStatuses.filter((s) => s.status === "warning").length;
  const dangerCount = memberStatuses.filter((s) => s.status === "danger").length;
  const score = Math.round((healthyCount / members.length) * 100);

  return { score, healthyCount, warningCount, dangerCount, memberStatuses };
}

export async function getUpcomingActions(): Promise<UpcomingActionsData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 1,
  );
  const weekEnd = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 7,
  );

  const [todayItems, thisWeekItems] = await Promise.all([
    prisma.actionItem.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        memberId: true,
        dueDate: true,
        status: true,
        member: { select: { name: true } },
      },
    }),
    prisma.actionItem.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { gte: todayEnd, lt: weekEnd },
      },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        memberId: true,
        dueDate: true,
        status: true,
        member: { select: { name: true } },
      },
    }),
  ]);

  const toActionWithMember = (item: (typeof todayItems)[number]): ActionItemWithMember => ({
    id: item.id,
    title: item.title,
    memberId: item.memberId,
    memberName: item.member.name,
    dueDate: item.dueDate as Date,
    status: item.status,
  });

  return {
    today: todayItems.map(toActionWithMember),
    thisWeek: thisWeekItems.map(toActionWithMember),
  };
}

type ConditionMetric = {
  type: ConditionAlertType;
  label: string;
  field: "mood" | "conditionMood" | "conditionHealth" | "conditionWorkload";
  threshold: number;
};

const CONDITION_METRICS: readonly ConditionMetric[] = [
  { type: "mood", label: "気分", field: "mood", threshold: MOOD_LOW_THRESHOLD },
  {
    type: "conditionMood",
    label: "気分コンディション",
    field: "conditionMood",
    threshold: CONDITION_LOW_THRESHOLD,
  },
  {
    type: "conditionHealth",
    label: "健康状態",
    field: "conditionHealth",
    threshold: CONDITION_LOW_THRESHOLD,
  },
  {
    type: "conditionWorkload",
    label: "業務負荷",
    field: "conditionWorkload",
    threshold: CONDITION_LOW_THRESHOLD,
  },
] as const;

export async function getConditionAlertMembers(): Promise<ConditionAlertMember[]> {
  const members = await prisma.member.findMany({
    select: {
      id: true,
      name: true,
      meetings: {
        orderBy: { date: "desc" },
        take: CONDITION_ALERT_CHECK_COUNT,
        select: {
          mood: true,
          conditionMood: true,
          conditionHealth: true,
          conditionWorkload: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const alertMembers: ConditionAlertMember[] = [];

  for (const member of members) {
    if (member.meetings.length < CONDITION_ALERT_MIN_MEETINGS) continue;

    const alerts: ConditionAlert[] = [];

    for (const metric of CONDITION_METRICS) {
      const values = member.meetings.map((m) => m[metric.field]);
      const trend = detectConditionDecline(values, metric.threshold);
      if (trend !== null) {
        alerts.push({
          type: metric.type,
          label: metric.label,
          values: values.filter((v): v is number => v !== null),
          trend,
        });
      }
    }

    if (alerts.length > 0) {
      alertMembers.push({
        memberId: member.id,
        memberName: member.name,
        alerts,
      });
    }
  }

  return alertMembers;
}
