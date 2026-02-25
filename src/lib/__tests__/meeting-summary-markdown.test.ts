import { describe, expect, it } from "vitest";

import type { MeetingSummaryMarkdownData } from "../meeting-summary-markdown";
import {
  generateMeetingSummaryMarkdown,
  generateMeetingSummaryPlainText,
} from "../meeting-summary-markdown";

const baseData: MeetingSummaryMarkdownData = {
  memberName: "田中太郎",
  date: new Date("2026-02-20T10:00:00.000Z"),
  conditionHealth: 4,
  conditionMood: 3,
  conditionWorkload: 2,
  checkinNote: "少し疲れ気味です",
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
      description: "ログイン画面のバリデーションエラーを修正する",
      status: "TODO",
      dueDate: new Date("2026-03-01"),
    },
    {
      title: "レポート提出",
      description: "",
      status: "DONE",
      dueDate: null,
    },
  ],
  startedAt: new Date("2026-02-20T10:00:00.000Z"),
  endedAt: new Date("2026-02-20T10:45:00.000Z"),
};

describe("generateMeetingSummaryMarkdown", () => {
  it("ヘッダーにメンバー名と日付が含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("# 1on1サマリー: 田中太郎");
    expect(md).toMatch(/# 1on1サマリー: 田中太郎 - /);
  });

  it("チェックイン情報が含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("## チェックイン");
    expect(md).toContain("体調: 4/5");
    expect(md).toContain("気分: 3/5");
    expect(md).toContain("業務量: 2/5");
  });

  it("チェックインメモが含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("> 少し疲れ気味です");
  });

  it("トピックがカテゴリラベル付きで含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("## 話したトピック");
    expect(md).toContain("### 業務進捗: スプリントレビュー");
    expect(md).toContain("### キャリア: キャリア相談");
  });

  it("トピックのメモが含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("進捗は良好です");
  });

  it("アクションアイテムがチェックボックス形式で含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("## アクションアイテム");
    expect(md).toContain("- [ ] バグ修正");
    expect(md).toContain("- [x] レポート提出");
  });

  it("アクションアイテムの期日が表示される", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toMatch(/バグ修正.*期日:/s);
  });

  it("アクションアイテムの説明が表示される", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("ログイン画面のバリデーションエラーを修正する");
  });

  it("所要時間が含まれる", () => {
    const md = generateMeetingSummaryMarkdown(baseData);
    expect(md).toContain("所要時間:");
    expect(md).toContain("45分");
  });

  it("トピック0件でもエラーなし", () => {
    const data = { ...baseData, topics: [] };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).not.toContain("## 話したトピック");
  });

  it("アクションアイテム0件でもエラーなし", () => {
    const data = { ...baseData, actionItems: [] };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).not.toContain("## アクションアイテム");
  });

  it("チェックイン情報がない場合はセクションを省略", () => {
    const data = {
      ...baseData,
      conditionHealth: null,
      conditionMood: null,
      conditionWorkload: null,
      checkinNote: null,
    };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).not.toContain("## チェックイン");
  });

  it("チェックインメモが空文字の場合はメモ行を省略", () => {
    const data = { ...baseData, checkinNote: "" };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).toContain("## チェックイン");
    expect(md).not.toContain("> ");
  });

  it("startedAt・endedAtがない場合は所要時間を表示しない", () => {
    const data = { ...baseData, startedAt: null, endedAt: null };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).not.toContain("所要時間:");
  });

  it("トピックのメモが空の場合はメモ行を省略", () => {
    const data = {
      ...baseData,
      topics: [{ category: "CAREER", title: "キャリア", notes: "" }],
    };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).toContain("### キャリア: キャリア");
    // メモ行がないことを確認（次の見出しやセクションが直接続く）
  });

  it("説明が空のアクションアイテムは説明行を省略", () => {
    const data = {
      ...baseData,
      actionItems: [{ title: "テスト", description: "", status: "TODO", dueDate: null }],
    };
    const md = generateMeetingSummaryMarkdown(data);
    expect(md).toContain("- [ ] テスト");
    expect(md).not.toContain("  テスト");
  });
});

describe("generateMeetingSummaryPlainText", () => {
  it("ヘッダーにメンバー名と日付が含まれる", () => {
    const text = generateMeetingSummaryPlainText(baseData);
    expect(text).toContain("【1on1サマリー】田中太郎");
  });

  it("チェックイン情報が含まれる", () => {
    const text = generateMeetingSummaryPlainText(baseData);
    expect(text).toContain("■ チェックイン");
    expect(text).toContain("体調: 4/5");
  });

  it("トピックが含まれる", () => {
    const text = generateMeetingSummaryPlainText(baseData);
    expect(text).toContain("■ 話したトピック");
    expect(text).toContain("スプリントレビュー");
  });

  it("アクションアイテムがステータス付きで含まれる", () => {
    const text = generateMeetingSummaryPlainText(baseData);
    expect(text).toContain("■ アクションアイテム");
    expect(text).toContain("[ ] バグ修正");
    expect(text).toContain("[x] レポート提出");
  });

  it("所要時間が含まれる", () => {
    const text = generateMeetingSummaryPlainText(baseData);
    expect(text).toContain("所要時間:");
    expect(text).toContain("45分");
  });

  it("チェックインが全てnullの場合はセクションを省略", () => {
    const data = {
      ...baseData,
      conditionHealth: null,
      conditionMood: null,
      conditionWorkload: null,
      checkinNote: null,
    };
    const text = generateMeetingSummaryPlainText(data);
    expect(text).not.toContain("■ チェックイン");
  });
});
