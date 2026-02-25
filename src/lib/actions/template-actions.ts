"use server";

import { revalidatePath } from "next/cache";

import type { MeetingTemplate } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateTemplateInput,
  TemplateExportFile,
  TemplateExportItem,
  UpdateTemplateInput,
} from "@/lib/validations/template-schema";
import {
  createTemplateSchema,
  templateExportFileSchema,
  updateTemplateSchema,
} from "@/lib/validations/template-schema";

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

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
};

export type ImportPreview = {
  templates: TemplateExportItem[];
  duplicateNames: string[];
};

export async function exportTemplates(): Promise<ActionResult<TemplateExportFile>> {
  return runAction(async () => {
    const templates = await prisma.meetingTemplate.findMany({
      where: { isDefault: false },
      orderBy: { createdAt: "asc" },
    });
    const items: TemplateExportItem[] = templates.map((t) => ({
      name: t.name,
      description: t.description,
      topics: Array.isArray(t.topics) ? (t.topics as TemplateExportItem["topics"]) : [],
    }));
    return {
      version: 1 as const,
      exportedAt: new Date().toISOString(),
      templates: items,
    };
  });
}

export async function previewImport(rawData: unknown): Promise<ActionResult<ImportPreview>> {
  return runAction(async () => {
    const parsed = templateExportFileSchema.parse(rawData);
    const names = parsed.templates.map((t) => t.name);
    const existing = await prisma.meetingTemplate.findMany({
      where: { name: { in: names } },
      select: { name: true },
    });
    const duplicateNames = existing.map((e) => e.name);
    return { templates: parsed.templates, duplicateNames };
  });
}

export async function importTemplates(
  rawData: unknown,
  overwriteNames: string[],
): Promise<ActionResult<ImportResult>> {
  return runAction(async () => {
    const parsed = templateExportFileSchema.parse(rawData);
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of parsed.templates) {
      const existing = await prisma.meetingTemplate.findUnique({ where: { name: item.name } });
      if (existing) {
        if (overwriteNames.includes(item.name)) {
          await prisma.meetingTemplate.update({
            where: { id: existing.id },
            data: { description: item.description, topics: item.topics },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.meetingTemplate.create({
          data: { name: item.name, description: item.description, topics: item.topics },
        });
        created++;
      }
    }

    revalidatePath("/settings/templates");
    revalidatePath("/", "layout");
    return { created, updated, skipped };
  });
}
