import { UserPlus } from "lucide-react";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { MemberListPage } from "@/components/member/member-list-page";
import { Button } from "@/components/ui/button";
import { getMembers } from "@/lib/actions/member-actions";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "メンバー一覧" }]} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">メンバー一覧</h1>
        <Link href="/members/new">
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            メンバーを追加
          </Button>
        </Link>
      </div>
      <MemberListPage members={members} />
    </div>
  );
}
