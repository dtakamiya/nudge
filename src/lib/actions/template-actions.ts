"use server";

import { revalidatePath } from "next/cache";

import type { MeetingTemplate } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateTemplateInput, UpdateTemplateInput } from "@/lib/validations/template-schema";
import { createTemplateSchema, updateTemplateSchema } from "@/lib/validations/template-schema";

import { type ActionResult, runAction } from "./types";

export async function getCustomTemplates(): Promise<MeetingTemplate[]> {
  return prisma.meetingTemplate.findMany({
    where: { isDefault: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTemplate(
  input: CreateTemplateInput,
): Promise<ActionResult<MeetingTemplate>> {
  return runAction(async () => {
    const validated = createTemplateSchema.parse(input);
    const existing = await prisma.meetingTemplate.findUnique({
      where: { name: validated.name },
    });
    if (existing) {
      throw new Error(`テンプレート名「${validated.name}」はすでに使用されています`);
    }
    const result = await prisma.meetingTemplate.create({ data: validated });
    revalidatePath("/settings/templates");
    revalidatePath("/", "layout");
    return result;
  });
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput,
): Promise<ActionResult<MeetingTemplate>> {
  return runAction(async () => {
    if (!id) throw new Error("テンプレートIDが指定されていません");
    const validated = updateTemplateSchema.parse(input);
    const existing = await prisma.meetingTemplate.findUnique({
      where: { name: validated.name },
    });
    if (existing && existing.id !== id) {
      throw new Error(`テンプレート名「${validated.name}」はすでに使用されています`);
    }
    const result = await prisma.meetingTemplate.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/settings/templates");
    revalidatePath("/", "layout");
    return result;
  });
}

export async function deleteTemplate(id: string): Promise<ActionResult<MeetingTemplate>> {
  return runAction(async () => {
    if (!id) throw new Error("テンプレートIDが指定されていません");
    const template = await prisma.meetingTemplate.findUnique({ where: { id } });
    if (!template) throw new Error("テンプレートが見つかりません");
    if (template.isDefault) {
      throw new Error("デフォルトテンプレートは削除できません");
    }
    const result = await prisma.meetingTemplate.delete({ where: { id } });
    revalidatePath("/settings/templates");
    revalidatePath("/", "layout");
    return result;
  });
}
