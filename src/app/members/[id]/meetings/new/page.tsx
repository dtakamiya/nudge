import { notFound } from "next/navigation";
import { getMember } from "@/lib/actions/member-actions";
import { getPreviousMeeting } from "@/lib/actions/meeting-actions";
import { getPendingActionItems } from "@/lib/actions/action-item-actions";
import { MeetingForm } from "@/components/meeting/meeting-form";
import { PreviousMeetingSidebar } from "@/components/meeting/previous-meeting-sidebar";

type Props = { params: Promise<{ id: string }> };

export default async function NewMeetingPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) { notFound(); }

  const previousMeeting = await getPreviousMeeting(id);
  const pendingActions = await getPendingActionItems(id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{member.name}との1on1</h1>
      <div className="flex gap-8">
        <div className="flex-1">
          <MeetingForm memberId={id} />
        </div>
        <div className="w-80 shrink-0">
          <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />
        </div>
      </div>
    </div>
  );
}
