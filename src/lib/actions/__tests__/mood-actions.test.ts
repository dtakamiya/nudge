import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

import { createMeeting, getMoodTrend, updateMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const result = await createMember({ name: "Mood Test Member" });
  if (!result.success) throw new Error(result.error);
  memberId = result.data.id;
});

describe("createMeeting with mood", () => {
  it("mood を指定して作成できる", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      mood: 4,
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const found = await prisma.meeting.findUnique({ where: { id: result.data.id } });
    expect(found?.mood).toBe(4);
  });

  it("mood を省略すると null になる", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const found = await prisma.meeting.findUnique({ where: { id: result.data.id } });
    expect(found?.mood).toBeNull();
  });

  it("mood が 1〜5 の範囲外だとバリデーションエラーになる", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      mood: 6 as number,
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateMeeting with mood", () => {
  it("既存ミーティングの mood を更新できる", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      mood: 2,
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);

    const updated = await updateMeeting({
      meetingId: created.data.id,
      date: new Date().toISOString(),
      mood: 5,
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(updated.success).toBe(true);
    if (!updated.success) return;
    const found = await prisma.meeting.findUnique({ where: { id: created.data.id } });
    expect(found?.mood).toBe(5);
  });

  it("mood を null に更新できる", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      mood: 3,
      topics: [],
      actionItems: [],
    });
    if (!created.success) throw new Error(created.error);

    const updated = await updateMeeting({
      meetingId: created.data.id,
      date: new Date().toISOString(),
      mood: null,
      topics: [],
      actionItems: [],
      deletedTopicIds: [],
      deletedActionItemIds: [],
    });
    expect(updated.success).toBe(true);
    const found = await prisma.meeting.findUnique({ where: { id: created.data.id } });
    expect(found?.mood).toBeNull();
  });
});

describe("getMoodTrend", () => {
  it("mood が記録されたミーティングを日付昇順で返す", async () => {
    await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      mood: 3,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
      mood: 5,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-03-01T10:00:00.000Z",
      mood: 4,
      topics: [],
      actionItems: [],
    });

    const trend = await getMoodTrend(memberId);
    expect(trend).toHaveLength(3);
    expect(trend[0].mood).toBe(3);
    expect(trend[1].mood).toBe(5);
    expect(trend[2].mood).toBe(4);
  });

  it("mood が null のミーティングは除外される", async () => {
    await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      mood: null,
      topics: [],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
      mood: 4,
      topics: [],
      actionItems: [],
    });

    const trend = await getMoodTrend(memberId);
    expect(trend).toHaveLength(1);
    expect(trend[0].mood).toBe(4);
  });

  it("mood がないメンバーは空配列を返す", async () => {
    const trend = await getMoodTrend(memberId);
    expect(trend).toHaveLength(0);
  });

  it("limit パラメータが機能する", async () => {
    for (let i = 1; i <= 5; i++) {
      await createMeeting({
        memberId,
        date: new Date(`2026-0${i}-01T10:00:00.000Z`).toISOString(),
        mood: i as 1 | 2 | 3 | 4 | 5,
        topics: [],
        actionItems: [],
      });
    }
    const trend = await getMoodTrend(memberId, 3);
    expect(trend).toHaveLength(3);
  });
});
