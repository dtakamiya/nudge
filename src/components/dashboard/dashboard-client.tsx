"use client";

import { type ReactNode } from "react";

import { MemberList } from "@/components/member/member-list";
import { useDashboardWidgetOrder } from "@/hooks/use-dashboard-widget-order";
import { useDashboardWidgetSettings, type WidgetKey } from "@/hooks/use-dashboard-widget-settings";
import type { HealthScoreData } from "@/lib/actions/dashboard-actions";
import type { getMembers } from "@/lib/actions/member-actions";
import type {
  ActivityItem,
  ConditionAlertMember,
  DashboardSummary,
  OverdueReminder,
  RecommendedMeeting,
  ScheduledMeeting,
  UpcomingActionsData,
} from "@/lib/types";

import { BrowserNotification } from "./browser-notification";
import { ConditionAlertSection } from "./condition-alert-section";
import { DashboardSettingsPopover } from "./dashboard-settings-popover";
import { DashboardSummary as DashboardSummaryWidget } from "./dashboard-summary";
import { HealthScoreWidget } from "./health-score-widget";
import { OnboardingCard } from "./onboarding-card";
import { RecentActivityFeed } from "./recent-activity-feed";
import { RecommendedMeetingsSection } from "./recommended-meetings-section";
import { ReminderAlertBanner } from "./reminder-alert-banner";
import { ScheduledMeetingsSection } from "./scheduled-meetings-section";
import { UpcomingActionsSection } from "./upcoming-actions-section";

type Members = Awaited<ReturnType<typeof getMembers>>;

type Props = {
  readonly members: Members;
  readonly summary: DashboardSummary;
  readonly healthScore: HealthScoreData;
  readonly recentActivity: ActivityItem[];
  readonly upcomingActions: UpcomingActionsData;
  readonly recommendedMeetings: RecommendedMeeting[];
  readonly scheduledMeetings: ScheduledMeeting[];
  readonly overdueReminders: OverdueReminder[];
  readonly conditionAlertMembers: ConditionAlertMember[];
};

export function DashboardClient({
  members,
  summary,
  healthScore,
  recentActivity,
  upcomingActions,
  recommendedMeetings,
  scheduledMeetings,
  overdueReminders,
  conditionAlertMembers,
}: Props) {
  const { settings, toggle, visibleCount } = useDashboardWidgetSettings();
  const { order, reorder } = useDashboardWidgetOrder();
  const isFirstTime = members.length === 0;

  const widgetRenderers: Record<WidgetKey, () => ReactNode> = {
    summary: () => <DashboardSummaryWidget summary={summary} />,
    healthScore: () => (
      <div className="mb-8">
        <HealthScoreWidget data={healthScore} />
      </div>
    ),
    recentActivity: () => (
      <div className="rounded-xl border bg-card p-5 mb-8">
        <h2 className="text-base font-semibold text-foreground mb-4">最近のアクティビティ</h2>
        <RecentActivityFeed activities={recentActivity} />
      </div>
    ),
    upcomingActions: () => (
      <div className="rounded-xl border bg-card p-5 mb-8">
        <h2 className="text-base font-semibold text-foreground mb-4">今週のタスク</h2>
        <UpcomingActionsSection today={upcomingActions.today} thisWeek={upcomingActions.thisWeek} />
      </div>
    ),
    scheduledMeetings: () => (
      <div className="rounded-xl border bg-card p-5 mb-8">
        <h2 className="text-base font-semibold text-foreground mb-4">今週の1on1予定</h2>
        <ScheduledMeetingsSection meetings={scheduledMeetings} />
      </div>
    ),
    recommendedMeetings: () =>
      recommendedMeetings.length > 0 ? (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">1on1すべきメンバー</h2>
          <RecommendedMeetingsSection members={recommendedMeetings} />
        </div>
      ) : null,
    memberList: () => <MemberList members={members} />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">ダッシュボード</h1>
        {!isFirstTime && (
          <DashboardSettingsPopover
            settings={settings}
            visibleCount={visibleCount}
            order={order}
            onToggle={toggle}
            onReorder={reorder}
          />
        )}
      </div>

      {!isFirstTime && <ReminderAlertBanner reminders={overdueReminders} />}
      {!isFirstTime && <ConditionAlertSection members={conditionAlertMembers} />}
      {!isFirstTime && <BrowserNotification reminders={overdueReminders} />}

      {isFirstTime ? (
        <OnboardingCard />
      ) : (
        order
          .filter((key) => settings[key])
          .map((key) => (
            <div key={key} data-testid={`widget-${key}`}>
              {widgetRenderers[key]()}
            </div>
          ))
      )}
    </div>
  );
}
