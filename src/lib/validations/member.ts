import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です").optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
