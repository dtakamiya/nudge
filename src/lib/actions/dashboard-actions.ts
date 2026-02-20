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

  const [members, actionCounts, meetingsThisMonth, overdueActions] =
    await Promise.all([
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
  const completedActions =
    actionCounts.find((g) => g.status === "DONE")?._count.id ?? 0;
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
