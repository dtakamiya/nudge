"use server";

import { revalidatePath } from "next/cache";

import type { ActionItem, Meeting, Topic } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateMeetingInput, UpdateMeetingInput } from "@/lib/validations/meeting";
import { createMeetingSchema, updateMeetingSchema } from "@/lib/validations/meeting";

import { getOrCreateTagsInTx } from "./tag-actions";
import { type ActionResult, runAction } from "./types";

type MeetingWithRelations = Meeting & { topics: Topic[]; actionItems: ActionItem[] };

export async function createMeeting(
  input: CreateMeetingInput,
): Promise<ActionResult<MeetingWithRelations>> {
  return runAction(async () => {
    const validated = createMeetingSchema.parse(input);
    const result = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.create({
        data: {
          memberId: validated.memberId,
          date: new Date(validated.date),
          mood: validated.mood ?? null,
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

      // トピックのタグ紐付け
      for (let i = 0; i < validated.topics.length; i++) {
        const topicInput = validated.topics[i];
        const topic = meeting.topics[i];
        if (!topic) continue;

        const newTagNames = topicInput.newTagNames ?? [];
        const tagIds = topicInput.tagIds ?? [];

        const newTags = newTagNames.length > 0 ? await getOrCreateTagsInTx(tx, newTagNames) : [];
        const allTagIds = [...new Set([...tagIds, ...newTags.map((t) => t.id)])];

        if (allTagIds.length > 0) {
          await tx.topicTag.createMany({
            data: allTagIds.map((tagId) => ({ topicId: topic.id, tagId })),
          });
        }
      }

      // アクションアイテムのタグ紐付け
      for (let i = 0; i < validated.actionItems.length; i++) {
        const itemInput = validated.actionItems[i];
        const actionItem = meeting.actionItems[i];
        if (!actionItem) continue;

        const newTagNames = itemInput.newTagNames ?? [];
        const tagIds = itemInput.tagIds ?? [];

        const newTags = newTagNames.length > 0 ? await getOrCreateTagsInTx(tx, newTagNames) : [];
        const allTagIds = [...new Set([...tagIds, ...newTags.map((t) => t.id)])];

        if (allTagIds.length > 0) {
          await tx.actionItemTag.createMany({
            data: allTagIds.map((tagId) => ({ actionItemId: actionItem.id, tagId })),
          });
        }
      }

      return meeting;
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
      topics: {
        orderBy: { sortOrder: "asc" },
        include: { tags: { include: { tag: true } } },
      },
      actionItems: {
        orderBy: { sortOrder: "asc" },
        include: { tags: { include: { tag: true } } },
      },
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

export async function getRecentMeetings(memberId: string, limit: number = 5) {
  return prisma.meeting.findMany({
    where: { memberId },
    orderBy: { date: "desc" },
    take: limit,
    include: { topics: { orderBy: { sortOrder: "asc" } }, actionItems: true },
  });
}

export async function updateMeeting(
  input: UpdateMeetingInput,
): Promise<ActionResult<MeetingWithRelations>> {
  return runAction(async () => {
    const validated = updateMeetingSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify meeting exists, update date/mood, and get memberId
      const meeting = await tx.meeting.update({
        where: { id: validated.meetingId },
        data: { date: new Date(validated.date), mood: validated.mood ?? null },
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

      // 4. Upsert topics with tags
      for (const topic of validated.topics) {
        const newTagNames = topic.newTagNames ?? [];
        const tagIds = topic.tagIds ?? [];
        const newTags = newTagNames.length > 0 ? await getOrCreateTagsInTx(tx, newTagNames) : [];
        const allTagIds = [...new Set([...tagIds, ...newTags.map((t) => t.id)])];

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
          // タグを全削除してから再作成
          await tx.topicTag.deleteMany({ where: { topicId: topic.id } });
          if (allTagIds.length > 0) {
            await tx.topicTag.createMany({
              data: allTagIds.map((tagId) => ({ topicId: topic.id!, tagId })),
            });
          }
        } else {
          const newTopic = await tx.topic.create({
            data: {
              meetingId: validated.meetingId,
              category: topic.category,
              title: topic.title,
              notes: topic.notes,
              sortOrder: topic.sortOrder,
            },
          });
          if (allTagIds.length > 0) {
            await tx.topicTag.createMany({
              data: allTagIds.map((tagId) => ({ topicId: newTopic.id, tagId })),
            });
          }
        }
      }

      // 5. Upsert action items with tags
      for (const item of validated.actionItems) {
        const newTagNames = item.newTagNames ?? [];
        const tagIds = item.tagIds ?? [];
        const newTags = newTagNames.length > 0 ? await getOrCreateTagsInTx(tx, newTagNames) : [];
        const allTagIds = [...new Set([...tagIds, ...newTags.map((t) => t.id)])];

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
          // タグを全削除してから再作成
          await tx.actionItemTag.deleteMany({ where: { actionItemId: item.id } });
          if (allTagIds.length > 0) {
            await tx.actionItemTag.createMany({
              data: allTagIds.map((tagId) => ({ actionItemId: item.id!, tagId })),
            });
          }
        } else {
          const newItem = await tx.actionItem.create({
            data: {
              meetingId: validated.meetingId,
              memberId: meeting.memberId,
              title: item.title,
              description: item.description,
              sortOrder: item.sortOrder,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
            },
          });
          if (allTagIds.length > 0) {
            await tx.actionItemTag.createMany({
              data: allTagIds.map((tagId) => ({ actionItemId: newItem.id, tagId })),
            });
          }
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

export type MoodTrendEntry = {
  date: Date;
  mood: number;
};

export async function getMoodTrend(
  memberId: string,
  limit: number = 10,
): Promise<MoodTrendEntry[]> {
  const meetings = await prisma.meeting.findMany({
    where: { memberId, mood: { not: null } },
    orderBy: { date: "asc" },
    take: limit,
    select: { date: true, mood: true },
  });
  return meetings
    .filter((m): m is { date: Date; mood: number } => m.mood !== null)
    .map((m) => ({ date: m.date, mood: m.mood }));
}

export async function deleteMeeting(id: string): Promise<ActionResult<Meeting>> {
  return runAction(async () => {
    if (!id) throw new Error("ミーティングIDが指定されていません");
    const result = await prisma.meeting.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
