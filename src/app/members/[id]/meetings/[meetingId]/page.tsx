import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeeting } from "@/lib/actions/meeting-actions";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { MeetingDetail } from "@/components/meeting/meeting-detail";
import { MeetingDeleteDialog } from "@/components/meeting/meeting-delete-dialog";
import { Breadcrumb } from "@/components/layout/breadcrumb";

type Props = { params: Promise<{ id: string; meetingId: string }> };

export default async function MeetingDetailPage({ params }: Props) {
  const { id, meetingId } = await params;
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    notFound();
  }

  const actionItemsWithMeeting = meeting.actionItems.map((a) => ({
    ...a,
    meeting: { date: meeting.date },
  }));

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
      <MeetingDetail
        date={meeting.date}
        topics={meeting.topics}
        actionItems={actionItemsWithMeeting}
      />
    </div>
  );
}
