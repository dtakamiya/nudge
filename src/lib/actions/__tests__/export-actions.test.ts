import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getMeetingsForExport } from "../export-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("getMeetingsForExport", () => {
  it("メンバーのミーティングデータを取得する", async () => {
    const memberResult = await createMember({ name: "テスト太郎", department: "開発部" });
    if (!memberResult.success) throw new Error("member creation failed");
    const memberId = memberResult.data.id;

    await createMeeting({
      memberId,
      date: "2025-01-15",
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "進捗確認",
          notes: "問題なし",
          sortOrder: 0,
        },
      ],
      actionItems: [],
    });

    const result = await getMeetingsForExport({ memberId });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.member.name).toBe("テスト太郎");
    expect(result.data.member.department).toBe("開発部");
    expect(result.data.meetings).toHaveLength(1);
    expect(result.data.meetings[0].topics).toHaveLength(1);
    expect(result.data.meetings[0].topics[0].title).toBe("進捗確認");
  });

  it("期間指定でミーティングを絞り込む", async () => {
    const memberResult = await createMember({ name: "期間テスト" });
    if (!memberResult.success) throw new Error("member creation failed");
    const memberId = memberResult.data.id;

    await createMeeting({
      memberId,
      date: "2025-01-10",
      topics: [{ category: "OTHER", title: "古いミーティング", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2025-03-20",
      topics: [{ category: "OTHER", title: "新しいミーティング", notes: "", sortOrder: 0 }],
      actionItems: [],
    });

    const result = await getMeetingsForExport({
      memberId,
      startDate: "2025-02-01",
      endDate: "2025-04-30",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.meetings).toHaveLength(1);
    expect(result.data.meetings[0].topics[0].title).toBe("新しいミーティング");
  });

  it("存在しないメンバーIDの場合はエラーを返す", async () => {
    const result = await getMeetingsForExport({ memberId: "non-existent-id" });
    expect(result.success).toBe(false);
  });

  it("アクションアイテムも含んで返す", async () => {
    const memberResult = await createMember({ name: "アクションテスト" });
    if (!memberResult.success) throw new Error("member creation failed");
    const memberId = memberResult.data.id;

    await createMeeting({
      memberId,
      date: "2025-02-01",
      topics: [],
      actionItems: [
        {
          title: "タスクA",
          description: "詳細A",
          dueDate: "2025-02-28",
          sortOrder: 0,
        },
      ],
    });

    const result = await getMeetingsForExport({ memberId });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.meetings[0].actionItems).toHaveLength(1);
    expect(result.data.meetings[0].actionItems[0].title).toBe("タスクA");
  });

  it("日付降順でミーティングが返る", async () => {
    const memberResult = await createMember({ name: "順序テスト" });
    if (!memberResult.success) throw new Error("member creation failed");
    const memberId = memberResult.data.id;

    await createMeeting({
      memberId,
      date: "2025-01-01",
      topics: [{ category: "OTHER", title: "1月", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2025-03-01",
      topics: [{ category: "OTHER", title: "3月", notes: "", sortOrder: 0 }],
      actionItems: [],
    });

    const result = await getMeetingsForExport({ memberId });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.meetings[0].topics[0].title).toBe("3月");
    expect(result.data.meetings[1].topics[0].title).toBe("1月");
  });
});
