import { z } from "zod";

const MEETING_INTERVAL_OPTIONS = [7, 14, 30] as const;

export const createMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  department: z.string().optional(),
  position: z.string().optional(),
  meetingIntervalDays: z
    .number()
    .refine(
      (v) => MEETING_INTERVAL_OPTIONS.includes(v as (typeof MEETING_INTERVAL_OPTIONS)[number]),
      {
        message: "ミーティング間隔は 7・14・30 日のいずれかを選択してください",
      },
    )
    .optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です").optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  meetingIntervalDays: z
    .number()
    .refine(
      (v) => MEETING_INTERVAL_OPTIONS.includes(v as (typeof MEETING_INTERVAL_OPTIONS)[number]),
      {
        message: "ミーティング間隔は 7・14・30 日のいずれかを選択してください",
      },
    )
    .optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
