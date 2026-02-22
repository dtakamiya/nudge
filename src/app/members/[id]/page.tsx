import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember } from "@/lib/actions/member-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { MeetingHistory } from "@/components/meeting/meeting-history";
import { ActionListCompact } from "@/components/action/action-list-compact";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MemberEditDialog } from "@/components/member/member-edit-dialog";
import { MemberDeleteDialog } from "@/components/member/member-delete-dialog";
import { TopicAnalyticsSection } from "@/components/analytics/topic-analytics-section";

type Props = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }
  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: member.name }]} />
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
          <MemberDeleteDialog memberId={member.id} memberName={member.name} />
          <MemberEditDialog
            member={{
              id: member.id,
              name: member.name,
              department: member.department,
              position: member.position,
            }}
          />
          <Link href={`/members/${id}/meetings/prepare`}>
            <Button variant="outline">1on1 を準備</Button>
          </Link>
          <Link href={`/members/${id}/meetings/new`}>
            <Button>新規1on1</Button>
          </Link>
        </div>
      </div>

      <TopicAnalyticsSection memberId={id} />

      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground mt-8">1on1履歴</h2>
      <MeetingHistory meetings={member.meetings} memberId={id} />
      <Separator className="my-6" />
      <h2 className="text-lg font-semibold tracking-tight mb-3 text-foreground">
        アクションアイテム
      </h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
