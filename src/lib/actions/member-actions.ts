"use server";

import { revalidatePath } from "next/cache";

import type { ActionItem, Meeting, Member, Topic } from "@/generated/prisma/client";
import { MEETINGS_PAGE_SIZE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { CreateMemberInput, UpdateMemberInput } from "@/lib/validations/member";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations/member";

import { type ActionResult, runAction } from "./types";

type MeetingWithRelations = Meeting & { topics: Topic[]; actionItems: ActionItem[] };

type ActionItemWithMeeting = ActionItem & { meeting: { date: Date } | null };

export type MemberWithStats = Member & {
  actionItems: ActionItemWithMeeting[];
  lastMeetingDate: Date | null;
  totalMeetingCount: number;
  pendingActionItems: ActionItemWithMeeting[];
};

export type MeetingsPage = {
  meetings: MeetingWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export async function getMembers() {
  const now = new Date();
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { actionItems: { where: { status: { not: "DONE" } } } } },
      meetings: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
      actionItems: {
        where: {
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
        select: { id: true },
      },
    },
  });

  return members.map((member) => ({
    ...member,
    overdueActionCount: member.actionItems.length,
    actionItems: undefined,
  }));
}

export async function getMember(id: string): Promise<MemberWithStats | null> {
  const [member, totalMeetingCount] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      include: {
        actionItems: {
          orderBy: { createdAt: "desc" },
          include: { meeting: { select: { date: true } } },
        },
        meetings: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    }),
    prisma.meeting.count({ where: { memberId: id } }),
  ]);

  if (!member) return null;

  const lastMeetingDate = member.meetings[0]?.date ?? null;
  const { meetings: _meetings, ...memberData } = member;

  return {
    ...memberData,
    lastMeetingDate,
    totalMeetingCount,
    pendingActionItems: member.actionItems.filter((a) => a.status !== "DONE"),
  };
}

export async function getMemberMeetings(
  memberId: string,
  page: number = 1,
  pageSize: number = MEETINGS_PAGE_SIZE,
): Promise<MeetingsPage> {
  const skip = (page - 1) * pageSize;
  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where: { memberId },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
      include: {
        topics: { orderBy: { sortOrder: "asc" } },
        actionItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.meeting.count({ where: { memberId } }),
  ]);

  return {
    meetings,
    total,
    page,
    pageSize,
    hasNext: skip + meetings.length < total,
    hasPrev: page > 1,
  };
}

export async function createMember(input: CreateMemberInput): Promise<ActionResult<Member>> {
  return runAction(async () => {
    const validated = createMemberSchema.parse(input);
    const result = await prisma.member.create({ data: validated });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function updateMember(
  id: string,
  input: UpdateMemberInput,
): Promise<ActionResult<Member>> {
  return runAction(async () => {
    if (!id) throw new Error("メンバーIDが指定されていません");
    const validated = updateMemberSchema.parse(input);
    const result = await prisma.member.update({ where: { id }, data: validated });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function deleteMember(id: string): Promise<ActionResult<Member>> {
  return runAction(async () => {
    if (!id) throw new Error("メンバーIDが指定されていません");
    const result = await prisma.member.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
