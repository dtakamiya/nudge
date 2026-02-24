/**
 * 期限超過リマインダー
 */
export type OverdueReminder = {
  memberId: string;
  memberName: string;
  meetingIntervalDays: number;
  daysSinceLastMeeting: number | null;
};
