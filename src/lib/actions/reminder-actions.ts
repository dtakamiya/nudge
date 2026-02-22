"use server";

import { prisma } from "@/lib/prisma";

export type OverdueReminder = {
  memberId: string;
  memberName: string;
  meetingIntervalDays: number;
  daysSinceLastMeeting: number | null;
};

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
