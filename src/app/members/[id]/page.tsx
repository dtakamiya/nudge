import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionListCompact } from "@/components/action/action-list-compact";
import { ActionAnalyticsSection } from "@/components/analytics/action-analytics-section";
import { CheckinTrendSection } from "@/components/analytics/checkin-trend-section";
import { TopicAnalyticsSection } from "@/components/analytics/topic-analytics-section";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MeetingHistory } from "@/components/meeting/meeting-history";
import { CalendarExportButton } from "@/components/member/calendar-export-button";
import { MemberActionsDropdown } from "@/components/member/member-actions-dropdown";
import { MemberQuickActions } from "@/components/member/member-quick-actions";
import { MemberStatsBar } from "@/components/member/member-stats-bar";
import { MoodTrendChart } from "@/components/member/mood-trend-chart";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getMoodTrend } from "@/lib/actions/meeting-actions";
import { getMember, getMemberMeetings } from "@/lib/actions/member-actions";
import { calcNextRecommendedDate } from "@/lib/schedule";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function MemberDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [member, meetingsPage, moodTrend] = await Promise.all([
    getMember(id),
    getMemberMeetings(id, page),
    getMoodTrend(id, 10),
  ]);

  if (!member) {
    notFound();
  }

  const nextMeetingDate = calcNextRecommendedDate(
    member.lastMeetingDate,
    member.meetingIntervalDays,
  );

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: "メンバー一覧", href: "/members" },
          { label: member.name },
        ]}
      />
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <AvatarInitial name={member.name} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{member.name}</h1>
            <p className="text-muted-foreground">
              {[member.department, member.position].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/members/${id}/meetings/prepare`}>
            <Button>1on1 を準備</Button>
          </Link>
          <Link href={`/members/${id}/meetings/new`}>
            <Button variant="outline">新規1on1</Button>
          </Link>
          <CalendarExportButton memberName={member.name} nextMeetingDate={nextMeetingDate} />
          <MemberActionsDropdown
            member={{
              id: member.id,
              name: member.name,
              department: member.department,
              position: member.position,
            }}
          />
        </div>
      </div>

      <MemberStatsBar
        lastMeetingDate={member.lastMeetingDate}
        totalMeetingCount={member.totalMeetingCount}
        pendingActionCount={member.pendingActionItems.length}
        meetingIntervalDays={member.meetingIntervalDays}
      />

      <TopicAnalyticsSection memberId={id} />
      <ActionAnalyticsSection memberId={id} />
      <CheckinTrendSection memberId={id} />

      {moodTrend.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">
            雰囲気の推移
          </h2>
          <MoodTrendChart data={moodTrend} />
        </div>
      )}

      <MemberQuickActions pendingActionItems={member.pendingActionItems} />

      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground mt-8">1on1履歴</h2>
      <MeetingHistory
        meetings={meetingsPage.meetings}
        memberId={id}
        pagination={{
          page: meetingsPage.page,
          total: meetingsPage.total,
          pageSize: meetingsPage.pageSize,
          hasNext: meetingsPage.hasNext,
          hasPrev: meetingsPage.hasPrev,
        }}
      />
      <Separator className="my-6" />
      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">
        アクションアイテム
      </h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
