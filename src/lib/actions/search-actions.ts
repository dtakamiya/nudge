"use server";

import { prisma } from "@/lib/prisma";
import { searchQuerySchema } from "@/lib/validations/search";
import { runAction, type ActionResult } from "./types";

export type MemberSearchResult = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
};

export type TopicSearchResult = {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  meetingId: string;
  memberId: string;
  memberName: string;
};

export type ActionItemSearchResult = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  memberId: string;
  memberName: string;
  meetingId: string | null;
};

export type SearchResults = {
  members: MemberSearchResult[];
  topics: TopicSearchResult[];
  actionItems: ActionItemSearchResult[];
};

const SEARCH_LIMIT = 5;

export async function searchAll(query: string): Promise<ActionResult<SearchResults>> {
  return runAction(async () => {
    const { query: validatedQuery } = searchQuerySchema.parse({ query });

    const [members, topics, actionItems] = await Promise.all([
      prisma.member.findMany({
        where: {
          OR: [
            { name: { contains: validatedQuery } },
            { department: { contains: validatedQuery } },
            { position: { contains: validatedQuery } },
          ],
        },
        select: { id: true, name: true, department: true, position: true },
        take: SEARCH_LIMIT,
        orderBy: { name: "asc" },
      }),
      prisma.topic.findMany({
        where: {
          OR: [{ title: { contains: validatedQuery } }, { notes: { contains: validatedQuery } }],
        },
        select: {
          id: true,
          title: true,
          notes: true,
          category: true,
          meetingId: true,
          meeting: {
            select: {
              memberId: true,
              member: { select: { name: true } },
            },
          },
        },
        take: SEARCH_LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.actionItem.findMany({
        where: {
          OR: [
            { title: { contains: validatedQuery } },
            { description: { contains: validatedQuery } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          memberId: true,
          meetingId: true,
          member: { select: { name: true } },
        },
        take: SEARCH_LIMIT,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      members,
      topics: topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        notes: topic.notes,
        category: topic.category,
        meetingId: topic.meetingId,
        memberId: topic.meeting.memberId,
        memberName: topic.meeting.member.name,
      })),
      actionItems: actionItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        memberId: item.memberId,
        memberName: item.member.name,
        meetingId: item.meetingId,
      })),
    };
  });
}
