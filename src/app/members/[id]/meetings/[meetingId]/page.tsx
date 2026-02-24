import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CoachingPanel } from "@/components/meeting/coaching-panel";
import { MeetingDetailPageClient } from "@/components/meeting/meeting-detail-page-client";
import { MeetingHeaderActions } from "@/components/meeting/meeting-header-actions";
import { MeetingNavigation } from "@/components/meeting/meeting-navigation";
import { PrintButton } from "@/components/meeting/print-button";
import { Button } from "@/components/ui/button";
import { getAdjacentMeetings, getMeeting, getPreviousMeeting } from "@/lib/actions/meeting-actions";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string; meetingId: string }> };

export default async function MeetingDetailPage({ params }: Props) {
  const { id, meetingId } = await params;
  const [meeting, previousMeeting, adjacentMeetings] = await Promise.all([
    getMeeting(meetingId),
    getPreviousMeeting(id, meetingId),
    getAdjacentMeetings(id, meetingId),
  ]);
  if (!meeting) {
    notFound();
  }

  return (
    <div className="animate-fade-in-up">
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "ダッシュボード", href: "/" },
            { label: meeting.member.name, href: `/members/${id}` },
            { label: formatDate(meeting.date) },
          ]}
        />
      </div>
      <MeetingNavigation
        memberId={id}
        previous={adjacentMeetings.previous}
        next={adjacentMeetings.next}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {meeting.member.name}との1on1
        </h1>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <MeetingHeaderActions
            meetingId={meetingId}
            memberId={id}
            meetingDate={formatDate(meeting.date)}
          />
          <Link href={`/members/${id}`}>
            <Button variant="outline">戻る</Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <MeetingDetailPageClient
            meetingId={meetingId}
            memberId={id}
            memberName={meeting.member.name}
            date={meeting.date}
            mood={meeting.mood}
            conditionHealth={meeting.conditionHealth}
            conditionMood={meeting.conditionMood}
            conditionWorkload={meeting.conditionWorkload}
            checkinNote={meeting.checkinNote}
            startedAt={meeting.startedAt}
            endedAt={meeting.endedAt}
            previousConditions={
              previousMeeting
                ? {
                    health: previousMeeting.conditionHealth,
                    mood: previousMeeting.conditionMood,
                    workload: previousMeeting.conditionWorkload,
                  }
                : undefined
            }
            topics={meeting.topics.map((t) => ({
              id: t.id,
              category: t.category,
              title: t.title,
              notes: t.notes,
              sortOrder: t.sortOrder,
              tags: t.tags.map((tt) => ({
                id: tt.tag.id,
                name: tt.tag.name,
                color: tt.tag.color,
              })),
            }))}
            actionItems={meeting.actionItems.map((a) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              sortOrder: a.sortOrder,
              status: a.status,
              dueDate: a.dueDate,
              meeting: { date: meeting.date },
              tags: a.tags.map((at) => ({
                id: at.tag.id,
                name: at.tag.name,
                color: at.tag.color,
              })),
            }))}
          />
        </div>
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-6">
            <CoachingPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
