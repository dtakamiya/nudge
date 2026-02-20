import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { formatRelativeDate } from "@/lib/format";

type MemberWithStats = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  _count: { actionItems: number };
  meetings: { date: Date }[];
  overdueActionCount: number;
};

function getLastMeetingColorClass(date: Date | null): string {
  if (!date) return "text-[#C27549]";
  const diffDays = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays >= 14) return "text-[#C27549]";
  if (diffDays >= 7) return "text-[oklch(0.65_0.17_70)]";
  return "text-[#6B8F71]";
}

type Props = {
  members: MemberWithStats[];
};

export function MemberList({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>メンバーがまだ登録されていません</p>
        <Link href="/members/new">
          <Button className="mt-4">メンバーを追加</Button>
        </Link>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => {
    const dateA = a.meetings[0]?.date ? new Date(a.meetings[0].date).getTime() : 0;
    const dateB = b.meetings[0]?.date ? new Date(b.meetings[0].date).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="grid gap-4">
      {sortedMembers.map((member, index) => (
        <Card
          key={member.id}
          className={`animate-fade-in-up hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(61,46,31,0.10)] stagger-${Math.min(index + 1, 5)}`}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <AvatarInitial name={member.name} size="lg" />
              <div>
                <Link
                  href={`/members/${member.id}`}
                  className="text-base font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
                >
                  {member.name}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {[member.department, member.position].filter(Boolean).join(" / ")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {member.overdueActionCount > 0 && (
                  <Badge variant="destructive" className="bg-[#C27549]">
                    期限超過 {member.overdueActionCount}件
                  </Badge>
                )}
                {member._count.actionItems > 0 && (
                  <Badge variant="status-todo">未完了 {member._count.actionItems}件</Badge>
                )}
              </div>
              <span
                className={`text-sm ${getLastMeetingColorClass(member.meetings[0]?.date ?? null)}`}
              >
                {formatRelativeDate(member.meetings[0]?.date ?? null)}
              </span>
              <Link href={`/members/${member.id}/meetings/new`}>
                <Button size="sm">新規1on1</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
