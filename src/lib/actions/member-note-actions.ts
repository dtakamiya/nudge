"use server";

import { revalidatePath } from "next/cache";

import type { MemberNote } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateMemberNoteInput, UpdateMemberNoteInput } from "@/lib/validations/member-note";
import { createMemberNoteSchema, updateMemberNoteSchema } from "@/lib/validations/member-note";

import { type ActionResult, runAction } from "./types";

/** メンバーのメモ一覧を取得（カテゴリフィルタ対応） */
export async function getMemberNotes(memberId: string, category?: string): Promise<MemberNote[]> {
  const where: { memberId: string; category?: string } = { memberId };
  if (category) {
    where.category = category;
  }
  return prisma.memberNote.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/** メモを作成 */
export async function createMemberNote(
  input: CreateMemberNoteInput,
): Promise<ActionResult<MemberNote>> {
  return runAction(async () => {
    const validated = createMemberNoteSchema.parse(input);
    const result = await prisma.memberNote.create({
      data: {
        memberId: validated.memberId,
        content: validated.content,
        category: validated.category,
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

/** メモを更新 */
export async function updateMemberNote(
  id: string,
  input: UpdateMemberNoteInput,
): Promise<ActionResult<MemberNote>> {
  return runAction(async () => {
    if (!id) throw new Error("メモIDが指定されていません");
    const validated = updateMemberNoteSchema.parse(input);
    const result = await prisma.memberNote.update({
      where: { id },
      data: {
        content: validated.content,
        category: validated.category,
      },
    });
    revalidatePath("/", "layout");
    return result;
  });
}

/** メモを削除 */
export async function deleteMemberNote(id: string): Promise<ActionResult<MemberNote>> {
  return runAction(async () => {
    if (!id) throw new Error("メモIDが指定されていません");
    const result = await prisma.memberNote.delete({ where: { id } });
    revalidatePath("/", "layout");
    return result;
  });
}
