import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MeetingDeleteDialog } from "@/components/meeting/meeting-delete-dialog";
import { MeetingDetailPageClient } from "@/components/meeting/meeting-detail-page-client";
import { Button } from "@/components/ui/button";
import { getMeeting } from "@/lib/actions/meeting-actions";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string; meetingId: string }> };

export default async function MeetingDetailPage({ params }: Props) {
  const { id, meetingId } = await params;
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    notFound();
  }

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: meeting.member.name, href: `/members/${id}` },
          { label: formatDate(meeting.date) },
        ]}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {meeting.member.name}との1on1
        </h1>
        <div className="flex gap-2">
          <MeetingDeleteDialog
            meetingId={meetingId}
            memberId={id}
            meetingDate={formatDate(meeting.date)}
          />
          <Link href={`/members/${id}`}>
            <Button variant="outline">戻る</Button>
          </Link>
        </div>
      </div>
      <MeetingDetailPageClient
        meetingId={meetingId}
        memberId={id}
        date={meeting.date}
        mood={meeting.mood}
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
  );
}
