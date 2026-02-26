import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { getRecommendedAndScheduledMeetings } from "@/lib/actions/analytics-actions";
import {
  getConditionAlertMembers,
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
    conditionAlertMembers,
  ] = await Promise.all([
    getMembers(),
    getDashboardSummary(),
    getHealthScore(),
    getRecentActivity(),
    getUpcomingActions(),
    getRecommendedAndScheduledMeetings(),
    getOverdueReminders(),
    getConditionAlertMembers(),
  ]);

  return (
    <div>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <DashboardClient
        members={members}
        summary={summary}
        healthScore={healthScore}
        recentActivity={recentActivity}
        upcomingActions={upcomingActions}
        recommendedMeetings={recommendedMeetings}
        scheduledMeetings={scheduledMeetings}
        overdueReminders={overdueReminders}
        conditionAlertMembers={conditionAlertMembers}
      />
    </div>
  );
}
