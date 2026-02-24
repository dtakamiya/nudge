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
