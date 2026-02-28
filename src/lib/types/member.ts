import type { ActionItem, Meeting, Member, Topic } from "@/generated/prisma/client";

/**
 * ミーティング（トピック・アクションアイテム含む）
 */
export type MeetingWithRelations = Meeting & {
  topics: Topic[];
  actionItems: ActionItem[];
};

/**
 * アクションアイテム（ミーティング日付含む）
 */
export type ActionItemWithMeeting = ActionItem & {
  meeting: { date: Date } | null;
};

/**
 * メンバー詳細（統計情報含む）
 */
export type MemberWithStats = Member & {
  actionItems: ActionItemWithMeeting[];
  lastMeetingDate: Date | null;
  totalMeetingCount: number;
  pendingActionItems: ActionItemWithMeeting[];
};

/**
 * ページネーション付きミーティング一覧
 */
export type MeetingsPage = {
  meetings: MeetingWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * タイムラインエントリ（ミーティング実施）
 */
export type MeetingTimelineEntry = {
  type: "meeting";
  id: string;
  date: Date;
  mood: number | null;
  topicCount: number;
  actionCount: number;
};

/**
 * タイムラインエントリ（アクション完了）
 */
export type ActionCompletedEntry = {
  type: "action_completed";
  id: string;
  title: string;
  completedAt: Date;
  meetingId: string;
};

/**
 * タイムラインエントリ（アクション期限超過）
 */
export type ActionOverdueEntry = {
  type: "action_overdue";
  id: string;
  title: string;
  dueDate: Date;
  meetingId: string;
};

/**
 * タイムラインエントリ（ゴール達成）
 */
export type GoalCompletedEntry = {
  type: "goal_completed";
  id: string;
  title: string;
  completedAt: Date;
  memberId: string;
};

/**
 * メンバータイムラインエントリ（ユニオン型）
 */
export type MemberTimelineEntry =
  | MeetingTimelineEntry
  | ActionCompletedEntry
  | ActionOverdueEntry
  | GoalCompletedEntry;
