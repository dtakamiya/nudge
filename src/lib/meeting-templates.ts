export type TopicCategory = "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER";

export type MeetingTemplate = {
  id: string;
  name: string;
  description: string;
  topics: ReadonlyArray<{ category: TopicCategory; title: string }>;
};

export const MEETING_TEMPLATES: readonly MeetingTemplate[] = [
  {
    id: "regular-checkin",
    name: "定期チェックイン",
    description: "通常の 1on1 での進捗確認と課題の共有",
    topics: [
      { category: "WORK_PROGRESS", title: "今週の進捗報告" },
      { category: "ISSUES", title: "困っていること" },
    ],
  },
  {
    id: "career",
    name: "キャリア面談",
    description: "中長期のキャリア目標とフィードバック",
    topics: [
      { category: "CAREER", title: "中長期のキャリア目標" },
      { category: "FEEDBACK", title: "最近の良かった点" },
    ],
  },
  {
    id: "problem-solving",
    name: "課題解決",
    description: "特定の課題にフォーカスした議論",
    topics: [
      { category: "ISSUES", title: "解決したい課題" },
      { category: "WORK_PROGRESS", title: "関連タスクの状況" },
    ],
  },
  {
    id: "free",
    name: "フリー",
    description: "テンプレートなし — 自由に話題を追加",
    topics: [],
  },
] as const;
