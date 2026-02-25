"use server";

import { prisma } from "@/lib/prisma";
import type { ActionItemDueSoon, OverdueReminder } from "@/lib/types";

export async function getOverdueReminders(): Promise<OverdueReminder[]> {
  const now = new Date();

  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
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
  });

  const reminders: OverdueReminder[] = [];

  for (const member of members) {
    const lastMeeting = member.meetings[0];

    if (!lastMeeting) {
      reminders.push({
        memberId: member.id,
        memberName: member.name,
        meetingIntervalDays: member.meetingIntervalDays,
        daysSinceLastMeeting: null,
      });
      continue;
    }

    const diffMs = now.getTime() - new Date(lastMeeting.date).getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysSince > member.meetingIntervalDays) {
      reminders.push({
        memberId: member.id,
        memberName: member.name,
        meetingIntervalDays: member.meetingIntervalDays,
        daysSinceLastMeeting: daysSince,
      });
    }
  }

  // 経過日数降順（nullは最後）
  return reminders.sort((a, b) => {
    if (a.daysSinceLastMeeting === null && b.daysSinceLastMeeting === null) return 0;
    if (a.daysSinceLastMeeting === null) return 1;
    if (b.daysSinceLastMeeting === null) return -1;
    return b.daysSinceLastMeeting - a.daysSinceLastMeeting;
  });
}

/**
 * 期限が今日・明日・期限切れの未完了アクションアイテムを取得する（ブラウザ通知用）
 */
export async function getActionItemsDueSoon(): Promise<ActionItemDueSoon[]> {
  const now = new Date();

  // 今日の開始（00:00:00）
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // 明日の終了（翌日 23:59:59.999）
  const tomorrowEnd = new Date(todayStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);
  tomorrowEnd.setMilliseconds(tomorrowEnd.getMilliseconds() - 1);

  const items = await prisma.actionItem.findMany({
    where: {
      status: { not: "DONE" },
      dueDate: { lte: tomorrowEnd },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      memberId: true,
      member: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return items
    .filter((item): item is typeof item & { dueDate: Date } => item.dueDate !== null)
    .map((item) => ({
      id: item.id,
      title: item.title,
      dueDate: item.dueDate,
      memberId: item.memberId,
      memberName: item.member.name,
      isOverdue: item.dueDate < todayStart,
    }));
}
