/**
 * アクション月別トレンド
 */
export type ActionMonthlyTrend = {
  month: string;
  created: number;
  completed: number;
};

/**
 * アクショントレンド集計結果
 */
export type ActionTrendResult = {
  averageCompletionDays: number;
  onTimeCompletionRate: number;
  monthlyTrends: ActionMonthlyTrend[];
};

/**
 * ミーティング頻度（月別）
 */
export type MeetingFrequencyMonth = {
  month: string;
  count: number;
};

/**
 * おすすめミーティング候補
 */
export type RecommendedMeeting = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  daysSinceLast: number;
  lastMeetingDate: Date | null;
  meetingIntervalDays: number;
  nextRecommendedDate: Date | null;
};

/**
 * 今週のスケジュールされたミーティング
 */
export type ScheduledMeeting = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  meetingIntervalDays: number;
  nextRecommendedDate: Date;
  lastMeetingDate: Date;
};

/**
 * メンバー別ミーティングヒートマップエントリ
 */
export type MemberMeetingHeatmapEntry = {
  memberId: string;
  memberName: string;
  department: string | null;
  months: { month: string; count: number }[];
};

/**
 * ヒートマップデータ
 */
export type HeatmapData = {
  members: MemberMeetingHeatmapEntry[];
  months: string[];
};

/**
 * メンバーインターバルソート種別
 */
export type MemberIntervalSort = "name" | "last_meeting" | "department";

/**
 * メンバーインターバルオプション
 */
export type MemberIntervalOptions = {
  department?: string;
  sort?: MemberIntervalSort;
};
