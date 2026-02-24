"use server";

import { prisma } from "@/lib/prisma";
import type {
  ActionItemSearchResult,
  MemberSearchResult,
  SearchResults,
  TagSearchResult,
  TopicSearchResult,
} from "@/lib/types";
import { searchQuerySchema } from "@/lib/validations/search";

import { type ActionResult, runAction } from "./types";

export type {
  ActionItemSearchResult,
  MemberSearchResult,
  SearchResults,
  TagSearchResult,
  TopicSearchResult,
};

const SEARCH_LIMIT = 5;

export async function searchAll(query: string): Promise<ActionResult<SearchResults>> {
  return runAction(async () => {
    const { query: validatedQuery } = searchQuerySchema.parse({ query });

    const [members, topics, actionItems, tags] = await Promise.all([
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
      prisma.tag.findMany({
        where: {
          name: { contains: validatedQuery },
        },
        select: { id: true, name: true, color: true },
        take: SEARCH_LIMIT,
        orderBy: { name: "asc" },
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
      tags,
    };
  });
}
