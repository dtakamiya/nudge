import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeeting } from "@/lib/actions/meeting-actions";
import { Button } from "@/components/ui/button";
import { MeetingDetail } from "@/components/meeting/meeting-detail";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {meeting.member.name}との1on1
        </h1>
        <Link href={`/members/${id}`}>
          <Button variant="outline">戻る</Button>
        </Link>
      </div>
      <MeetingDetail
        date={meeting.date}
        topics={meeting.topics}
        actionItems={actionItemsWithMeeting}
      />
    </div>
  );
}
