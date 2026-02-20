import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember } from "@/lib/actions/member-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { MeetingHistory } from "@/components/meeting/meeting-history";
import { ActionListCompact } from "@/components/action/action-list-compact";

type Props = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <AvatarInitial name={member.name} size="lg" />
          <div>
            <h1 className="font-heading text-3xl text-foreground">{member.name}</h1>
            <p className="text-muted-foreground">
              {[member.department, member.position].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>
        <Link href={`/members/${id}/meetings/new`}>
          <Button>新規1on1</Button>
        </Link>
      </div>
      <h2 className="font-heading text-xl mb-3 text-foreground">1on1履歴</h2>
      <MeetingHistory meetings={member.meetings} memberId={id} />
      <Separator className="my-6" />
      <h2 className="font-heading text-xl mb-3 text-foreground">アクションアイテム</h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
