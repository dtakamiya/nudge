import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HealthScoreData } from "@/lib/actions/dashboard-actions";
import type {
  ActivityItem,
  ConditionAlertMember,
  DashboardSummary,
  OverdueReminder,
  RecommendedMeeting,
  ScheduledMeeting,
  UpcomingActionsData,
} from "@/lib/types";

import { DashboardClient } from "../dashboard-client";

// next/navigation をモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// useDashboardWidgetSettings をモックして任意の設定を注入できるようにする
vi.mock("@/hooks/use-dashboard-widget-settings", () => ({
  useDashboardWidgetSettings: () => ({
    settings: {
      summary: true,
      healthScore: true,
      recentActivity: true,
      upcomingActions: true,
      scheduledMeetings: true,
      recommendedMeetings: true,
      memberList: true,
    },
    toggle: vi.fn(),
    visibleCount: 7,
  }),
  WIDGET_KEYS: [
    "summary",
    "healthScore",
    "recentActivity",
    "upcomingActions",
    "scheduledMeetings",
    "recommendedMeetings",
    "memberList",
  ],
  WIDGET_LABELS: {
    summary: "サマリー",
    healthScore: "健全性スコア",
    recentActivity: "最近のアクティビティ",
    upcomingActions: "今週のタスク",
    scheduledMeetings: "今週の1on1予定",
    recommendedMeetings: "1on1すべきメンバー",
    memberList: "メンバー一覧",
  },
  DEFAULT_WIDGET_SETTINGS: {
    summary: true,
    healthScore: true,
    recentActivity: true,
    upcomingActions: true,
    scheduledMeetings: true,
    recommendedMeetings: true,
    memberList: true,
  },
}));

const baseSummary: DashboardSummary = {
  needsFollowUp: 0,
  actionCompletionRate: 0,
  totalActions: 0,
  completedActions: 0,
  meetingsThisMonth: 0,
  overdueActions: 0,
};

const baseHealthScore: HealthScoreData = {
  score: 100,
  healthyCount: 0,
  warningCount: 0,
  dangerCount: 0,
  memberStatuses: [],
};

const baseUpcomingActions: UpcomingActionsData = {
  today: [],
  thisWeek: [],
};

const baseProps = {
  members: [],
  summary: baseSummary,
  healthScore: baseHealthScore,
  recentActivity: [] as ActivityItem[],
  upcomingActions: baseUpcomingActions,
  recommendedMeetings: [] as RecommendedMeeting[],
  scheduledMeetings: [] as ScheduledMeeting[],
  overdueReminders: [] as OverdueReminder[],
  conditionAlertMembers: [] as ConditionAlertMember[],
};

afterEach(() => {
  cleanup();
});

describe("DashboardClient", () => {
  it("メンバーがいない場合はオンボーディングカードを表示する", () => {
    render(<DashboardClient {...baseProps} />);
    // OnboardingCard の「Nudge へようこそ！」テキストで検索
    expect(screen.getByText(/Nudge へようこそ/i)).toBeDefined();
  });

  it("ウィジェット設定ボタンは isFirstTime の場合は表示されない", () => {
    render(<DashboardClient {...baseProps} />);
    // members が空の場合は設定ボタンが表示されないこと
    expect(screen.queryByRole("button", { name: "ウィジェット表示設定" })).toBeNull();
  });
});
