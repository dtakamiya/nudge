"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createMeetingSchema, updateMeetingSchema } from "@/lib/validations/meeting";
import type { CreateMeetingInput, UpdateMeetingInput } from "@/lib/validations/meeting";
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
          create: validated.actionItems.map((item, index) => ({
            memberId: validated.memberId,
            title: item.title,
            description: item.description,
            sortOrder: item.sortOrder ?? index,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
          })),
        },
      },
      include: {
        topics: { orderBy: { sortOrder: "asc" } },
        actionItems: { orderBy: { sortOrder: "asc" } },
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

export async function getMeeting(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      member: true,
      topics: { orderBy: { sortOrder: "asc" } },
      actionItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getPreviousMeeting(memberId: string, excludeMeetingId?: string) {
  return prisma.meeting.findFirst({
    where: { memberId, ...(excludeMeetingId ? { id: { not: excludeMeetingId } } : {}) },
    orderBy: { date: "desc" },
    include: { topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
  });
}

export async function updateMeeting(
  input: UpdateMeetingInput,
): Promise<ActionResult<MeetingWithRelations>> {
  return runAction(async () => {
    const validated = updateMeetingSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify meeting exists, update date, and get memberId
      const meeting = await tx.meeting.update({
        where: { id: validated.meetingId },
        data: { date: new Date(validated.date) },
        select: { memberId: true },
      });

      // 2. Delete removed topics
      if (validated.deletedTopicIds.length > 0) {
        await tx.topic.deleteMany({
          where: { id: { in: validated.deletedTopicIds } },
        });
      }

      // 3. Delete removed action items
      if (validated.deletedActionItemIds.length > 0) {
        await tx.actionItem.deleteMany({
          where: { id: { in: validated.deletedActionItemIds } },
        });
      }

      // 4. Upsert topics
      for (const topic of validated.topics) {
        if (topic.id) {
          await tx.topic.update({
            where: { id: topic.id },
            data: {
              category: topic.category,
              title: topic.title,
              notes: topic.notes,
              sortOrder: topic.sortOrder,
            },
          });
        } else {
          await tx.topic.create({
            data: {
              meetingId: validated.meetingId,
              category: topic.category,
              title: topic.title,
              notes: topic.notes,
              sortOrder: topic.sortOrder,
            },
          });
        }
      }

      // 5. Upsert action items
      for (const item of validated.actionItems) {
        if (item.id) {
          await tx.actionItem.update({
            where: { id: item.id },
            data: {
              title: item.title,
              description: item.description,
              sortOrder: item.sortOrder,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
        } else {
          await tx.actionItem.create({
            data: {
              meetingId: validated.meetingId,
              memberId: meeting.memberId,
              title: item.title,
              description: item.description,
              sortOrder: item.sortOrder,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
        }
      }

      // 6. Return updated meeting with relations
      return tx.meeting.findUniqueOrThrow({
        where: { id: validated.meetingId },
        include: {
          topics: { orderBy: { sortOrder: "asc" } },
          actionItems: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    revalidatePath("/", "layout");
    return result;
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
