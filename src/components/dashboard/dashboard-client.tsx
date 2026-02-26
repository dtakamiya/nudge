"use client";

import { MemberList } from "@/components/member/member-list";
import { useDashboardWidgetSettings } from "@/hooks/use-dashboard-widget-settings";
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
  const isFirstTime = members.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">ダッシュボード</h1>
        {!isFirstTime && (
          <DashboardSettingsPopover
            settings={settings}
            visibleCount={visibleCount}
            onToggle={toggle}
          />
        )}
      </div>

      {!isFirstTime && <ReminderAlertBanner reminders={overdueReminders} />}
      {!isFirstTime && <ConditionAlertSection members={conditionAlertMembers} />}
      {!isFirstTime && <BrowserNotification reminders={overdueReminders} />}

      {isFirstTime ? (
        <OnboardingCard />
      ) : (
        settings.summary && <DashboardSummaryWidget summary={summary} />
      )}

      {!isFirstTime && settings.healthScore && (
        <div className="mb-8">
          <HealthScoreWidget data={healthScore} />
        </div>
      )}

      {!isFirstTime && (settings.recentActivity || settings.upcomingActions) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {settings.recentActivity && (
            <div className="lg:col-span-2 rounded-xl border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">最近のアクティビティ</h2>
              <RecentActivityFeed activities={recentActivity} />
            </div>
          )}
          {settings.upcomingActions && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">今週のタスク</h2>
              <UpcomingActionsSection
                today={upcomingActions.today}
                thisWeek={upcomingActions.thisWeek}
              />
            </div>
          )}
        </div>
      )}

      {!isFirstTime && settings.scheduledMeetings && (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">今週の1on1予定</h2>
          <ScheduledMeetingsSection meetings={scheduledMeetings} />
        </div>
      )}

      {!isFirstTime && settings.recommendedMeetings && recommendedMeetings.length > 0 && (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">1on1すべきメンバー</h2>
          <RecommendedMeetingsSection members={recommendedMeetings} />
        </div>
      )}

      {settings.memberList && <MemberList members={members} />}
    </div>
  );
}
