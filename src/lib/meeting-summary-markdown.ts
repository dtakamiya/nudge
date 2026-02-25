import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatDuration } from "@/lib/format";

type TopicData = {
  readonly category: string;
  readonly title: string;
  readonly notes: string;
};

type ActionItemData = {
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly dueDate: Date | null;
};

export type MeetingSummaryMarkdownData = {
  readonly memberName: string;
  readonly date: Date;
  readonly conditionHealth?: number | null;
  readonly conditionMood?: number | null;
  readonly conditionWorkload?: number | null;
  readonly checkinNote?: string | null;
  readonly topics: ReadonlyArray<TopicData>;
  readonly actionItems: ReadonlyArray<ActionItemData>;
  readonly startedAt: Date | null;
  readonly endedAt: Date | null;
};

function hasCheckinData(data: MeetingSummaryMarkdownData): boolean {
  return (
    data.conditionHealth != null ||
    data.conditionMood != null ||
    data.conditionWorkload != null ||
    (data.checkinNote != null && data.checkinNote !== "")
  );
}

function formatCheckinSection(data: MeetingSummaryMarkdownData): string[] {
  if (!hasCheckinData(data)) return [];

  const lines: string[] = ["## チェックイン", ""];
  if (data.conditionHealth != null) {
    lines.push(`- 体調: ${data.conditionHealth}/5`);
  }
  if (data.conditionMood != null) {
    lines.push(`- 気分: ${data.conditionMood}/5`);
  }
  if (data.conditionWorkload != null) {
    lines.push(`- 業務量: ${data.conditionWorkload}/5`);
  }
  if (data.checkinNote) {
    lines.push("", `> ${data.checkinNote}`);
  }
  return lines;
}

function formatTopicsSectionMd(topics: ReadonlyArray<TopicData>): string[] {
  if (topics.length === 0) return [];

  const lines: string[] = ["## 話したトピック", ""];
  for (const topic of topics) {
    const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;
    lines.push(`### ${categoryLabel}: ${topic.title}`);
    if (topic.notes) {
      lines.push("", topic.notes);
    }
    lines.push("");
  }
  return lines;
}

function formatActionCheckbox(status: string): string {
  return status === "DONE" ? "[x]" : "[ ]";
}

function formatActionItemsSectionMd(actionItems: ReadonlyArray<ActionItemData>): string[] {
  if (actionItems.length === 0) return [];

  const lines: string[] = ["## アクションアイテム", ""];
  for (const item of actionItems) {
    const checkbox = formatActionCheckbox(item.status);
    const due = item.dueDate ? `（期日: ${formatDate(item.dueDate)}）` : "";
    lines.push(`- ${checkbox} ${item.title}${due}`);
    if (item.description) {
      lines.push(`  ${item.description}`);
    }
  }
  return lines;
}

function formatDurationSectionMd(startedAt: Date | null, endedAt: Date | null): string[] {
  if (!startedAt || !endedAt) return [];

  const start = startedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const end = endedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const duration = formatDuration(startedAt, endedAt);
  return ["---", "", `所要時間: ${start}〜${end}（${duration}）`];
}

export function generateMeetingSummaryMarkdown(data: MeetingSummaryMarkdownData): string {
  const header = `# 1on1サマリー: ${data.memberName} - ${formatDate(data.date)}`;
  const sections: string[][] = [[header]];

  const checkin = formatCheckinSection(data);
  if (checkin.length > 0) sections.push(checkin);

  const topics = formatTopicsSectionMd(data.topics);
  if (topics.length > 0) sections.push(topics);

  const actions = formatActionItemsSectionMd(data.actionItems);
  if (actions.length > 0) sections.push(actions);

  const duration = formatDurationSectionMd(data.startedAt, data.endedAt);
  if (duration.length > 0) sections.push(duration);

  return sections.map((s) => s.join("\n")).join("\n\n");
}

// --- Plain text version ---

function formatCheckinSectionPlain(data: MeetingSummaryMarkdownData): string[] {
  if (!hasCheckinData(data)) return [];

  const lines: string[] = ["■ チェックイン"];
  if (data.conditionHealth != null) {
    lines.push(`  体調: ${data.conditionHealth}/5`);
  }
  if (data.conditionMood != null) {
    lines.push(`  気分: ${data.conditionMood}/5`);
  }
  if (data.conditionWorkload != null) {
    lines.push(`  業務量: ${data.conditionWorkload}/5`);
  }
  if (data.checkinNote) {
    lines.push(`  メモ: ${data.checkinNote}`);
  }
  return lines;
}

function formatTopicsSectionPlain(topics: ReadonlyArray<TopicData>): string[] {
  if (topics.length === 0) return [];

  const lines: string[] = ["■ 話したトピック"];
  for (const topic of topics) {
    const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;
    lines.push(`- ${topic.title}（${categoryLabel}）`);
    if (topic.notes) {
      lines.push(`  ${topic.notes}`);
    }
  }
  return lines;
}

function formatActionItemsSectionPlain(actionItems: ReadonlyArray<ActionItemData>): string[] {
  if (actionItems.length === 0) return [];

  const lines: string[] = ["■ アクションアイテム"];
  for (const item of actionItems) {
    const checkbox = formatActionCheckbox(item.status);
    const due = item.dueDate ? `（期日: ${formatDate(item.dueDate)}）` : "";
    lines.push(`- ${checkbox} ${item.title}${due}`);
    if (item.description) {
      lines.push(`  ${item.description}`);
    }
  }
  return lines;
}

function formatDurationSectionPlain(startedAt: Date | null, endedAt: Date | null): string[] {
  if (!startedAt || !endedAt) return [];

  const start = startedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const end = endedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const duration = formatDuration(startedAt, endedAt);
  return [`所要時間: ${start}〜${end}（${duration}）`];
}

export function generateMeetingSummaryPlainText(data: MeetingSummaryMarkdownData): string {
  const header = `【1on1サマリー】${data.memberName} - ${formatDate(data.date)}`;
  const sections: string[][] = [[header]];

  const checkin = formatCheckinSectionPlain(data);
  if (checkin.length > 0) sections.push(checkin);

  const topics = formatTopicsSectionPlain(data.topics);
  if (topics.length > 0) sections.push(topics);

  const actions = formatActionItemsSectionPlain(data.actionItems);
  if (actions.length > 0) sections.push(actions);

  const duration = formatDurationSectionPlain(data.startedAt, data.endedAt);
  if (duration.length > 0) sections.push(duration);

  return sections.map((s) => s.join("\n")).join("\n\n");
}
