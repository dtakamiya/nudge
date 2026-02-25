/**
 * 期限超過リマインダー
 */
export type OverdueReminder = {
  memberId: string;
  memberName: string;
  meetingIntervalDays: number;
  daysSinceLastMeeting: number | null;
};

/**
 * 期限が近い・期限切れのアクションアイテム（ブラウザ通知用）
 */
export type ActionItemDueSoon = {
  id: string;
  title: string;
  dueDate: Date;
  memberId: string;
  memberName: string;
  isOverdue: boolean;
};
