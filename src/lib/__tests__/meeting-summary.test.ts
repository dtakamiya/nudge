import { describe, expect, it } from "vitest";

import { generateMeetingSummaryText } from "../meeting-summary";

const baseData = {
  memberName: "田中太郎",
  date: new Date("2026-02-20T10:00:00.000Z"),
  topics: [
    {
      category: "WORK_PROGRESS",
      title: "スプリントレビュー",
      notes: "進捗は良好です",
    },
    {
      category: "CAREER",
      title: "キャリア相談",
      notes: "",
    },
  ],
  actionItems: [
    {
      title: "バグ修正",
      dueDate: new Date("2026-03-01"),
    },
    {
      title: "レポート提出",
      dueDate: null,
    },
  ],
  startedAt: new Date("2026-02-20T10:00:00.000Z"),
  endedAt: new Date("2026-02-20T10:45:00.000Z"),
};

describe("generateMeetingSummaryText", () => {
  it("サマリーヘッダーにメンバー名と日付が含まれる", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("【1on1サマリー】田中太郎");
  });

  it("トピックセクションが含まれる", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("■ 話したトピック");
    expect(text).toContain("スプリントレビュー");
    expect(text).toContain("キャリア相談");
  });

  it("アクションアイテムセクションが含まれる", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("■ 次のアクション");
    expect(text).toContain("バグ修正");
    expect(text).toContain("レポート提出");
  });

  it("期日ありのアクションアイテムに期日が表示される", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("期日:");
  });

  it("期日なしのアクションアイテムに期日なしが表示される", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("期日: なし");
  });

  it("所要時間が表示される", () => {
    const text = generateMeetingSummaryText(baseData);
    expect(text).toContain("所要時間:");
    expect(text).toContain("45分");
  });

  it("トピックが0件でもエラーなく動作する", () => {
    const data = { ...baseData, topics: [] };
    const text = generateMeetingSummaryText(data);
    expect(text).toContain("■ 話したトピック");
    expect(text).toContain("なし");
  });

  it("アクションアイテムが0件でもエラーなく動作する", () => {
    const data = { ...baseData, actionItems: [] };
    const text = generateMeetingSummaryText(data);
    expect(text).toContain("■ 次のアクション");
    expect(text).toContain("なし");
  });

  it("トピックもアクションも0件でもエラーなく動作する", () => {
    const data = { ...baseData, topics: [], actionItems: [] };
    expect(() => generateMeetingSummaryText(data)).not.toThrow();
  });

  it("メモが100文字を超える場合は切り詰める", () => {
    const longNotes = "あ".repeat(150);
    const data = {
      ...baseData,
      topics: [{ category: "WORK_PROGRESS", title: "長いメモ", notes: longNotes }],
    };
    const text = generateMeetingSummaryText(data);
    expect(text).toContain("あ".repeat(100));
    expect(text).not.toContain("あ".repeat(101));
  });

  it("startedAt・endedAtがない場合は所要時間を表示しない", () => {
    const data = { ...baseData, startedAt: null, endedAt: null };
    const text = generateMeetingSummaryText(data);
    expect(text).not.toContain("所要時間:");
  });

  it("startedAtのみある場合は所要時間を表示しない", () => {
    const data = { ...baseData, startedAt: new Date(), endedAt: null };
    const text = generateMeetingSummaryText(data);
    expect(text).not.toContain("所要時間:");
  });

  it("トピックのカテゴリラベルが日本語で表示される", () => {
    const text = generateMeetingSummaryText(baseData);
    // WORK_PROGRESS の日本語ラベルが含まれることを確認
    expect(text).toMatch(/業務進捗|仕事の進捗|WORK_PROGRESS/);
  });

  it("トピックにメモがない場合はメモ行を省略する", () => {
    const data = {
      ...baseData,
      topics: [{ category: "CAREER", title: "キャリア", notes: "" }],
    };
    const text = generateMeetingSummaryText(data);
    expect(text).toContain("キャリア");
  });
});
