import { getMembers } from "@/lib/actions/member-actions";
import {
  getDashboardSummary,
  getRecentActivity,
  getUpcomingActions,
} from "@/lib/actions/dashboard-actions";
import { getRecommendedMeetings } from "@/lib/actions/analytics-actions";
import { MemberList } from "@/components/member/member-list";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { UpcomingActionsSection } from "@/components/dashboard/upcoming-actions-section";
import { RecommendedMeetingsSection } from "@/components/dashboard/recommended-meetings-section";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [members, summary, recentActivity, upcomingActions, recommendedMeetings] =
    await Promise.all([
      getMembers(),
      getDashboardSummary(),
      getRecentActivity(),
      getUpcomingActions(),
      getRecommendedMeetings(),
    ]);

  const isFirstTime = members.length === 0;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">ダッシュボード</h1>

      {isFirstTime ? <OnboardingCard /> : <DashboardSummary summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            最近のアクティビティ
          </h2>
          <RecentActivityFeed activities={recentActivity} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            今週のタスク
          </h2>
          <UpcomingActionsSection
            today={upcomingActions.today}
            thisWeek={upcomingActions.thisWeek}
          />
        </div>
      </div>

      {recommendedMeetings.length > 0 && (
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            推奨: 1on1すべきメンバー
          </h2>
          <RecommendedMeetingsSection members={recommendedMeetings} />
        </div>
      )}

      <MemberList members={members} />
    </div>
  );
}
