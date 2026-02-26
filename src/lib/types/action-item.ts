/**
 * 引き継ぎアクションアイテム
 */
export type CarryoverAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
};

/**
 * 前回ミーティングの未完了アクション
 */
export type LastMeetingPendingActionsResult = {
  meetingId: string;
  meetingDate: Date;
  actions: CarryoverAction[];
} | null;

/**
 * 日付フィルタ種別
 */
export type DateFilterType = "all" | "overdue" | "this-week" | "this-month" | "no-date";

/**
 * ソート種別
 */
export type SortByType = "dueDate" | "createdAt" | "updatedAt" | "memberName" | "priority";

/**
 * 優先度種別
 */
export type PriorityType = "HIGH" | "MEDIUM" | "LOW";
