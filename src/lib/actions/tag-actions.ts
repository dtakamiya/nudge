"use server";

import { revalidatePath } from "next/cache";

import type { Tag } from "@/generated/prisma/client";
import { TAG_SUGGESTIONS_LIMIT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { CreateTagInput, UpdateTagInput } from "@/lib/validations/tag";
import { createTagSchema, updateTagSchema } from "@/lib/validations/tag";

import { type ActionResult, runAction } from "./types";

export type TagWithCount = {
  id: string;
  name: string;
  color: string;
  _count: { topics: number; actionItems: number };
};

// タグ一覧を使用頻度順（降順）で取得
export async function getTags(): Promise<TagWithCount[]> {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { topics: true, actionItems: true },
      },
    },
    orderBy: [{ topics: { _count: "desc" } }, { actionItems: { _count: "desc" } }, { name: "asc" }],
  });
  return tags;
}

// タグのサジェスト候補（名前の部分一致、TAG_SUGGESTIONS_LIMIT件上限）
export async function getTagSuggestions(query: string): Promise<Tag[]> {
  return prisma.tag.findMany({
    where: query
      ? {
          name: { contains: query },
        }
      : undefined,
    orderBy: { name: "asc" },
    take: TAG_SUGGESTIONS_LIMIT,
  });
}

// よく使うタグ上位
export async function getPopularTags(limit: number = 5): Promise<TagWithCount[]> {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { topics: true, actionItems: true },
      },
    },
    orderBy: [{ topics: { _count: "desc" } }, { actionItems: { _count: "desc" } }, { name: "asc" }],
    take: limit,
  });
  return tags;
}

// タグ作成（名前重複チェック含む）
export async function createTag(input: CreateTagInput): Promise<ActionResult<Tag>> {
  return runAction(async () => {
    const validated = createTagSchema.parse(input);
    const existing = await prisma.tag.findUnique({ where: { name: validated.name } });
    if (existing) {
      throw new Error(`タグ「${validated.name}」は既に存在します`);
    }
    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
        color: validated.color ?? "#6366f1",
      },
    });
    revalidatePath("/", "layout");
    return tag;
  });
}

// タグ更新
export async function updateTag(id: string, input: UpdateTagInput): Promise<ActionResult<Tag>> {
  return runAction(async () => {
    if (!id) throw new Error("タグIDが指定されていません");
    const validated = updateTagSchema.parse(input);
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(validated.name !== undefined ? { name: validated.name } : {}),
        ...(validated.color !== undefined ? { color: validated.color } : {}),
      },
    });
    revalidatePath("/", "layout");
    return tag;
  });
}

// タグ削除
export async function deleteTag(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    if (!id) throw new Error("タグIDが指定されていません");
    await prisma.tag.delete({ where: { id } });
    revalidatePath("/", "layout");
  });
}

// 名前配列からタグを取得、存在しなければ作成（getOrCreate）
export async function getOrCreateTags(names: string[]): Promise<Tag[]> {
  if (names.length === 0) return [];

  // 重複を除去
  const uniqueNames = [...new Set(names)];

  const results = await Promise.all(
    uniqueNames.map(async (name) => {
      const existing = await prisma.tag.findUnique({ where: { name } });
      if (existing) return existing;
      return prisma.tag.create({
        data: { name, color: "#6366f1" },
      });
    }),
  );

  return results;
}
