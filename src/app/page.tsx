import { getMembers } from "@/lib/actions/member-actions";
import { getDashboardSummary } from "@/lib/actions/dashboard-actions";
import { MemberList } from "@/components/member/member-list";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [members, summary] = await Promise.all([getMembers(), getDashboardSummary()]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">ダッシュボード</h1>
      <DashboardSummary summary={summary} />
      <MemberList members={members} />
    </div>
  );
}
