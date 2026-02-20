import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember } from "@/lib/actions/member-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-gray-500">
            {[member.department, member.position].filter(Boolean).join(" / ")}
          </p>
        </div>
        <Link href={`/members/${id}/meetings/new`}>
          <Button>新規1on1</Button>
        </Link>
      </div>
      <h2 className="text-lg font-semibold mb-3">1on1履歴</h2>
      <MeetingHistory meetings={member.meetings} memberId={id} />
      <Separator className="my-6" />
      <h2 className="text-lg font-semibold mb-3">アクションアイテム</h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
