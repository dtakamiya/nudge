import { getMembers } from "@/lib/actions/member-actions";
import { MemberList } from "@/components/member/member-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const members = await getMembers();
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">ダッシュボード</h1>
      <MemberList members={members} />
    </div>
  );
}
