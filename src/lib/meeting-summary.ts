import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatDuration } from "@/lib/format";

type TopicSummaryData = {
  readonly category: string;
  readonly title: string;
  readonly notes: string;
};

type ActionItemSummaryData = {
  readonly title: string;
  readonly dueDate: Date | null;
};

export type MeetingSummaryData = {
  readonly memberName: string;
  readonly date: Date;
  readonly topics: ReadonlyArray<TopicSummaryData>;
  readonly actionItems: ReadonlyArray<ActionItemSummaryData>;
  readonly startedAt: Date | null;
  readonly endedAt: Date | null;
};

const NOTES_MAX_LENGTH = 100;

function formatTopicsSection(topics: ReadonlyArray<TopicSummaryData>): string {
  if (topics.length === 0) {
    return "■ 話したトピック\nなし";
  }

  const lines = ["■ 話したトピック"];
  for (const topic of topics) {
    const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;
    lines.push(`- ${topic.title}（${categoryLabel}）`);
    if (topic.notes) {
      const truncated =
        topic.notes.length > NOTES_MAX_LENGTH
          ? topic.notes.slice(0, NOTES_MAX_LENGTH)
          : topic.notes;
      lines.push(`  ${truncated}`);
    }
  }
  return lines.join("\n");
}

function formatActionItemsSection(actionItems: ReadonlyArray<ActionItemSummaryData>): string {
  if (actionItems.length === 0) {
    return "■ 次のアクション\nなし";
  }

  const lines = ["■ 次のアクション"];
  for (const item of actionItems) {
    const due = item.dueDate ? `期日: ${formatDate(item.dueDate)}` : "期日: なし";
    lines.push(`- [ ] ${item.title}（${due}）`);
  }
  return lines.join("\n");
}

function formatDurationSection(startedAt: Date | null, endedAt: Date | null): string | null {
  if (!startedAt || !endedAt) return null;
  const start = startedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const end = endedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const duration = formatDuration(startedAt, endedAt);
  return `所要時間: ${start}〜${end}（${duration}）`;
}

export function generateMeetingSummaryText(data: MeetingSummaryData): string {
  const { memberName, date, topics, actionItems, startedAt, endedAt } = data;

  const header = `【1on1サマリー】${memberName} - ${formatDate(date)}`;
  const topicsSection = formatTopicsSection(topics);
  const actionsSection = formatActionItemsSection(actionItems);
  const durationSection = formatDurationSection(startedAt, endedAt);

  const parts = [header, "", topicsSection, "", actionsSection];
  if (durationSection) {
    parts.push("", durationSection);
  }

  return parts.join("\n");
}
