"use server";

import { z } from "zod";

import type { MeetingExportData, MemberExportData } from "@/lib/export";
import { prisma } from "@/lib/prisma";

import { type ActionResult, runAction } from "./types";

const exportQuerySchema = z.object({
  memberId: z.string().min(1, "メンバーIDは必須です"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ExportQueryInput = z.input<typeof exportQuerySchema>;

export type ExportResult = {
  member: MemberExportData;
  meetings: MeetingExportData[];
};

export async function getMeetingsForExport(
  input: ExportQueryInput,
): Promise<ActionResult<ExportResult>> {
  return runAction(async () => {
    const { memberId, startDate, endDate } = exportQuerySchema.parse(input);

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new Error("メンバーが見つかりません");
    }

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        memberId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        topics: { orderBy: { sortOrder: "asc" } },
        actionItems: { orderBy: { sortOrder: "asc" } },
      },
    });

    return {
      member: {
        id: member.id,
        name: member.name,
        department: member.department,
        position: member.position,
      },
      meetings: meetings.map((m) => ({
        id: m.id,
        date: m.date,
        topics: m.topics.map((t) => ({
          id: t.id,
          category: t.category,
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: m.actionItems.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          status: a.status,
          dueDate: a.dueDate,
        })),
      })),
    };
  });
}
