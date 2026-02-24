import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MeetingPrepare } from "@/components/meeting/meeting-prepare";
import { getLastMeetingAllActions, getPendingActionItems } from "@/lib/actions/action-item-actions";
import { getMember } from "@/lib/actions/member-actions";
import { getCustomTemplates } from "@/lib/actions/template-actions";
import { formatDateLong } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function PrepareMeetingPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }

  const today = formatDateLong(new Date());

  const [pendingActions, lastMeetingData, customTemplates] = await Promise.all([
    getPendingActionItems(id),
    getLastMeetingAllActions(id),
    getCustomTemplates(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: member.name, href: `/members/${id}` },
          { label: "1on1 準備" },
        ]}
      />
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {member.name}との1on1 準備
        </h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>
      <MeetingPrepare
        memberId={id}
        pendingActions={pendingActions}
        lastMeetingData={lastMeetingData}
        customTemplates={customTemplates}
      />
    </div>
  );
}
