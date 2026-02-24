import { Suspense } from "react";

import { BrowserNotification } from "@/components/dashboard/browser-notification";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { HealthScoreWidget } from "@/components/dashboard/health-score-widget";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { RecommendedMeetingsSection } from "@/components/dashboard/recommended-meetings-section";
import { ReminderAlertBanner } from "@/components/dashboard/reminder-alert-banner";
import { ScheduledMeetingsSection } from "@/components/dashboard/scheduled-meetings-section";
import { UpcomingActionsSection } from "@/components/dashboard/upcoming-actions-section";
import { MemberList } from "@/components/member/member-list";
import { getRecommendedAndScheduledMeetings } from "@/lib/actions/analytics-actions";
import {
  getDashboardSummary,
  getHealthScore,
  getRecentActivity,
  getUpcomingActions,
} from "@/lib/actions/dashboard-actions";
import { getMembers } from "@/lib/actions/member-actions";
import { getOverdueReminders } from "@/lib/actions/reminder-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    members,
    summary,
    healthScore,
    recentActivity,
    upcomingActions,
    { recommended: recommendedMeetings, scheduled: scheduledMeetings },
    overdueReminders,
  ] = await Promise.all([
    getMembers(),
    getDashboardSummary(),
    getHealthScore(),
    getRecentActivity(),
    getUpcomingActions(),
    getRecommendedAndScheduledMeetings(),
    getOverdueReminders(),
  ]);

  const isFirstTime = members.length === 0;

  return (
    <div>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">ダッシュボード</h1>

      {!isFirstTime && <ReminderAlertBanner reminders={overdueReminders} />}
      {!isFirstTime && <BrowserNotification reminders={overdueReminders} />}

      {isFirstTime ? <OnboardingCard /> : <DashboardSummary summary={summary} />}

      {!isFirstTime && (
        <div className="mb-8">
          <HealthScoreWidget data={healthScore} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">最近のアクティビティ</h2>
          <RecentActivityFeed activities={recentActivity} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">今週のタスク</h2>
          <UpcomingActionsSection
            today={upcomingActions.today}
            thisWeek={upcomingActions.thisWeek}
          />
        </div>
      </div>

      {!isFirstTime && (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">今週の1on1予定</h2>
          <ScheduledMeetingsSection meetings={scheduledMeetings} />
        </div>
      )}

      {recommendedMeetings.length > 0 && (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">1on1すべきメンバー</h2>
          <RecommendedMeetingsSection members={recommendedMeetings} />
        </div>
      )}

      <MemberList members={members} />
    </div>
  );
}
