import { notFound } from "next/navigation";

import { CoachingPanel } from "@/components/meeting/coaching";
import {
  MeetingDetailHeader,
  MeetingDetailPageClient,
  MeetingNavigation,
} from "@/components/meeting/detail";
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
      <MeetingDetailHeader
        memberId={id}
        memberName={meeting.member.name}
        meetingId={meetingId}
        meetingDate={formatDate(meeting.date)}
      />
      <MeetingNavigation
        memberId={id}
        previous={adjacentMeetings.previous}
        next={adjacentMeetings.next}
      />
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
