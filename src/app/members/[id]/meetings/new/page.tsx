import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MeetingForm } from "@/components/meeting/form";
import { PreviousMeetingSidebar } from "@/components/meeting/prepare";
import { getPendingActionItems } from "@/lib/actions/action-item-actions";
import { getPreviousMeeting } from "@/lib/actions/meeting-actions";
import { getMember } from "@/lib/actions/member-actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePreparedTopics(raw: string | string[] | undefined) {
  if (typeof raw !== "string") return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed as Array<{ category: string; title: string; notes: string; sortOrder: number }>;
  } catch {
    return undefined;
  }
}

function parseFollowUpActionIds(raw: string | string[] | undefined): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export default async function NewMeetingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const [previousMeeting, pendingActions] = await Promise.all([
    getPreviousMeeting(id),
    getPendingActionItems(id),
  ]);
  const initialTopics = parsePreparedTopics(resolvedSearchParams.preparedTopics);
  const followUpActionIds = parseFollowUpActionIds(resolvedSearchParams.followUpActionIds);

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb
        items={[
          { label: "ダッシュボード", href: "/" },
          { label: member.name, href: `/members/${id}` },
          { label: "新規1on1" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">
        {member.name}との1on1
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <MeetingForm
            memberId={id}
            initialTopics={initialTopics}
            previousConditions={
              previousMeeting
                ? {
                    health: previousMeeting.conditionHealth,
                    mood: previousMeeting.conditionMood,
                    workload: previousMeeting.conditionWorkload,
                  }
                : undefined
            }
          />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <PreviousMeetingSidebar
            previousMeeting={previousMeeting}
            pendingActions={pendingActions}
            followUpActionIds={followUpActionIds}
          />
        </div>
      </div>
    </div>
  );
}
