"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createMeetingSchema } from "@/lib/validations/meeting";
import type { CreateMeetingInput } from "@/lib/validations/meeting";
import type { Meeting, Topic, ActionItem } from "@/generated/prisma/client";
import { runAction, type ActionResult } from "./types";

type MeetingWithRelations = Meeting & { topics: Topic[]; actionItems: ActionItem[] };

export async function createMeeting(
  input: CreateMeetingInput,
): Promise<ActionResult<MeetingWithRelations>> {
  return runAction(async () => {
    const validated = createMeetingSchema.parse(input);
    const result = await prisma.meeting.create({
      data: {
        memberId: validated.memberId,
        date: new Date(validated.date),
        topics: {
          create: validated.topics.map((topic) => ({
            category: topic.category,
            title: topic.title,
            notes: topic.notes,
            sortOrder: topic.sortOrder,
          })),
        },
        actionItems: {
          create: validated.actionItems.map((item) => ({
            memberId: validated.memberId,
            title: item.title,
            description: item.description,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
          })),
        },
      },
      include: { topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function getMeeting(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: { member: true, topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
  });
}

export async function getPreviousMeeting(memberId: string, excludeMeetingId?: string) {
  return prisma.meeting.findFirst({
    where: { memberId, ...(excludeMeetingId ? { id: { not: excludeMeetingId } } : {}) },
    orderBy: { date: "desc" },
    include: { topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
  });
}

export async function deleteMeeting(id: string): Promise<ActionResult<Meeting>> {
  return runAction(async () => {
    if (!id) throw new Error("ミーティングIDが指定されていません");
    const result = await prisma.meeting.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
