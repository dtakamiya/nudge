import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type MemberWithStats = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  _count: { actionItems: number };
  meetings: { date: Date }[];
};

type Props = {
  members: MemberWithStats[];
};

export function MemberList({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>メンバーがまだ登録されていません</p>
        <Link href="/members/new">
          <Button className="mt-4">メンバーを追加</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <Link href={`/members/${member.id}`} className="font-medium hover:underline">
                  {member.name}
                </Link>
                <div className="text-sm text-gray-500">
                  {[member.department, member.position].filter(Boolean).join(" / ")}
                </div>
              </div>
              {member._count.actionItems > 0 && (
                <Badge variant="secondary">未完了 {member._count.actionItems}件</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {member.meetings[0] ? `最終: ${formatDate(member.meetings[0].date)}` : "未実施"}
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
