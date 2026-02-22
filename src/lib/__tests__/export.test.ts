import { describe, expect,it } from "vitest";

import {
  formatMeetingMarkdown,
  formatSingleMeetingMarkdown,
  type MeetingExportData,
  type MemberExportData,
} from "@/lib/export";

const sampleMember: MemberExportData = {
  id: "m1",
  name: "田中 太郎",
  department: "エンジニアリング",
  position: "シニアエンジニア",
};

const sampleMeetings: MeetingExportData[] = [
  {
    id: "meeting1",
    date: new Date("2025-01-15"),
    topics: [
      {
        id: "t1",
        category: "WORK_PROGRESS",
        title: "Q1 の進捗確認",
        notes: "プロジェクトAは順調に進んでいる。",
        sortOrder: 0,
      },
      {
        id: "t2",
        category: "CAREER",
        title: "スキルアップ計画",
        notes: "",
        sortOrder: 1,
      },
    ],
    actionItems: [
      {
        id: "a1",
        title: "APIドキュメント作成",
        description: "OpenAPI 仕様に合わせて更新",
        status: "TODO",
        dueDate: new Date("2025-01-31"),
      },
      {
        id: "a2",
        title: "レビュー依頼",
        description: "",
        status: "DONE",
        dueDate: null,
      },
    ],
  },
  {
    id: "meeting2",
    date: new Date("2025-02-05"),
    topics: [
      {
        id: "t3",
        category: "ISSUES",
        title: "スプリント遅延の原因分析",
        notes: "要件変更が主な原因。",
        sortOrder: 0,
      },
    ],
    actionItems: [],
  },
];

describe("formatMeetingMarkdown", () => {
  it("メンバー名とエクスポート情報がヘッダーに含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("# 1on1 サマリー - 田中 太郎");
    expect(result).toContain("田中 太郎");
    expect(result).toContain("エンジニアリング");
    expect(result).toContain("シニアエンジニア");
  });

  it("ミーティング数が含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("2");
  });

  it("各ミーティングの日付が含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("2025");
    expect(result).toContain("1");
    expect(result).toContain("15");
  });

  it("トピックのカテゴリラベルが日本語で含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("業務進捗");
    expect(result).toContain("キャリア");
    expect(result).toContain("課題・相談");
  });

  it("トピックのタイトルが含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("Q1 の進捗確認");
    expect(result).toContain("スキルアップ計画");
    expect(result).toContain("スプリント遅延の原因分析");
  });

  it("トピックのノートが含まれる（空でない場合）", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("プロジェクトAは順調に進んでいる。");
    expect(result).toContain("要件変更が主な原因。");
  });

  it("アクションアイテムのタイトルが含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("APIドキュメント作成");
    expect(result).toContain("レビュー依頼");
  });

  it("アクションアイテムのステータスが含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("TODO");
    expect(result).toContain("DONE");
  });

  it("期日が含まれる", () => {
    const result = formatMeetingMarkdown(sampleMember, sampleMeetings);
    expect(result).toContain("2025");
    expect(result).toContain("31");
  });

  it("アクションアイテムがない場合でも正常に動作する", () => {
    const result = formatMeetingMarkdown(sampleMember, [sampleMeetings[1]]);
    expect(result).toContain("スプリント遅延の原因分析");
  });

  it("ミーティングが空の場合はその旨を含む", () => {
    const result = formatMeetingMarkdown(sampleMember, []);
    expect(result).toContain("記録なし");
  });

  it("部署・役職がない場合でも正常に動作する", () => {
    const memberNoDetails: MemberExportData = { id: "m2", name: "鈴木 花子" };
    const result = formatMeetingMarkdown(memberNoDetails, sampleMeetings);
    expect(result).toContain("鈴木 花子");
  });
});

describe("formatSingleMeetingMarkdown", () => {
  it("単一ミーティングのMarkdownを生成する", () => {
    const result = formatSingleMeetingMarkdown(sampleMeetings[0]);
    expect(result).toContain("Q1 の進捗確認");
    expect(result).toContain("APIドキュメント作成");
  });

  it("日付が含まれる", () => {
    const result = formatSingleMeetingMarkdown(sampleMeetings[0]);
    expect(result).toContain("2025");
  });
});
