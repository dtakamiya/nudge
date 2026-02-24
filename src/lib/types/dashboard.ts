/**
 * ダッシュボードサマリー
 */
export type DashboardSummary = {
  needsFollowUp: number;
  actionCompletionRate: number;
  totalActions: number;
  completedActions: number;
  meetingsThisMonth: number;
  overdueActions: number;
};

/**
 * ミーティングアクティビティ
 */
export type MeetingActivityItem = {
  type: "meeting";
  id: string;
  memberId: string;
  memberName: string;
  date: Date;
};

/**
 * アクションアクティビティ
 */
export type ActionActivityItem = {
  type: "action";
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  completedAt: Date;
};

/**
 * アクティビティアイテム（ミーティング or アクション）
 */
export type ActivityItem = MeetingActivityItem | ActionActivityItem;

/**
 * メンバー付きアクションアイテム
 */
export type ActionItemWithMember = {
  id: string;
  title: string;
  memberId: string;
  memberName: string;
  dueDate: Date;
  status: string;
};

/**
 * 直近アクション一覧
 */
export type UpcomingActionsData = {
  today: ActionItemWithMember[];
  thisWeek: ActionItemWithMember[];
};
