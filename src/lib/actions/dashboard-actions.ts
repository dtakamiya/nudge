"use server";

import { prisma } from "@/lib/prisma";

export type DashboardSummary = {
  needsFollowUp: number;
  actionCompletionRate: number;
  totalActions: number;
  completedActions: number;
  meetingsThisMonth: number;
  overdueActions: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

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
    const lastMeeting = m.meetings[0];
    if (!lastMeeting) return true;
    return new Date(lastMeeting.date) < fourteenDaysAgo;
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

export type MeetingActivityItem = {
  type: "meeting";
  id: string;
  memberId: string;
  memberName: string;
  date: Date;
};

export type ActionActivityItem = {
  type: "action";
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  completedAt: Date;
};

export type ActivityItem = MeetingActivityItem | ActionActivityItem;

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

export type ActionItemWithMember = {
  id: string;
  title: string;
  memberId: string;
  memberName: string;
  dueDate: Date;
  status: string;
};

export type UpcomingActionsData = {
  today: ActionItemWithMember[];
  thisWeek: ActionItemWithMember[];
};

export async function getUpcomingActions(): Promise<UpcomingActionsData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

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
