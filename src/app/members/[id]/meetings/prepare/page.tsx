import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MeetingPrepare } from "@/components/meeting/meeting-prepare";
import { getPendingActionItems } from "@/lib/actions/action-item-actions";
import { getRecentMeetings } from "@/lib/actions/meeting-actions";
import { getMember } from "@/lib/actions/member-actions";

type Props = { params: Promise<{ id: string }> };

export default async function PrepareMeetingPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }

  const recentMeetings = await getRecentMeetings(id, 5);
  const pendingActions = await getPendingActionItems(id);

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: member.name, href: `/members/${id}` },
          { label: "1on1 準備" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">
        {member.name}との1on1 準備
      </h1>
      <MeetingPrepare
        memberId={id}
        recentMeetings={recentMeetings}
        pendingActions={pendingActions}
      />
    </div>
  );
}
