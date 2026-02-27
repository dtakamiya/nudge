import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export type TopicExportData = {
  id: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

export type ActionItemExportData = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
};

export type MeetingExportData = {
  id: string;
  date: Date;
  topics: TopicExportData[];
  actionItems: ActionItemExportData[];
};

export type MemberExportData = {
  id: string;
  name: string;
  department?: string | null;
  position?: string | null;
};

export type PrepareTopicData = {
  category: string;
  title: string;
  notes: string;
};

export type FollowUpActionData = {
  title: string;
  description: string;
};

function formatTopics(topics: TopicExportData[]): string {
  if (topics.length === 0) return "";

  const lines: string[] = ["### トピック", ""];
  for (const topic of topics) {
    const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;
    lines.push(`#### ${categoryLabel}: ${topic.title}`);
    if (topic.notes) {
      lines.push("", topic.notes);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function formatActionItems(actionItems: ActionItemExportData[]): string {
  if (actionItems.length === 0) return "";

  const lines: string[] = ["### アクションアイテム", ""];
  for (const item of actionItems) {
    const due = item.dueDate ? ` (期日: ${formatDate(item.dueDate)})` : "";
    lines.push(`- [${item.status}] ${item.title}${due}`);
    if (item.description) {
      lines.push(`  ${item.description}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function formatSingleMeetingMarkdown(meeting: MeetingExportData): string {
  const lines: string[] = [`## ${formatDate(meeting.date)} のミーティング`, ""];

  const topicsSection = formatTopics(meeting.topics);
  if (topicsSection) lines.push(topicsSection);

  const actionsSection = formatActionItems(meeting.actionItems);
  if (actionsSection) lines.push(actionsSection);

  lines.push("---");
  return lines.join("\n");
}

export function formatMeetingMarkdown(
  member: MemberExportData,
  meetings: MeetingExportData[],
): string {
  const memberInfo = [member.name, member.department, member.position].filter(Boolean).join(" / ");

  const lines: string[] = [
    `# 1on1 サマリー - ${member.name}`,
    "",
    `**メンバー:** ${memberInfo}`,
    `**ミーティング数:** ${meetings.length}`,
    "",
    "---",
    "",
  ];

  if (meetings.length === 0) {
    lines.push("記録なし");
    return lines.join("\n");
  }

  for (const meeting of meetings) {
    lines.push(formatSingleMeetingMarkdown(meeting));
    lines.push("");
  }

  return lines.join("\n");
}

export function formatPrepareAgendaMarkdown(
  memberName: string,
  topics: PrepareTopicData[],
  followUpActions: FollowUpActionData[],
): string {
  const validTopics = topics.filter((t) => t.title.trim() !== "");

  const lines: string[] = [
    `# 1on1 アジェンダ - ${memberName}`,
    `**日付:** ${formatDate(new Date())}`,
    "",
  ];

  if (validTopics.length > 0) {
    lines.push("## アジェンダ", "");
    validTopics.forEach((topic, index) => {
      const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;
      lines.push(`${index + 1}. [${categoryLabel}] ${topic.title}`);
      if (topic.notes) {
        lines.push(`   ${topic.notes}`);
      }
    });
    lines.push("");
  }

  if (followUpActions.length > 0) {
    lines.push("## 前回からの引き継ぎ", "");
    for (const action of followUpActions) {
      lines.push(`- [ ] ${action.title}`);
      if (action.description) {
        lines.push(`  ${action.description}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
