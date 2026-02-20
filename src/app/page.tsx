import { getMembers } from "@/lib/actions/member-actions";
import { MemberList } from "@/components/member/member-list";

export default async function DashboardPage() {
  const members = await getMembers();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <MemberList members={members} />
    </div>
  );
}
