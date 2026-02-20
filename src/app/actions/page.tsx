import { Suspense } from "react";
import { getActionItems } from "@/lib/actions/action-item-actions";
import { getMembers } from "@/lib/actions/member-actions";
import { ActionListFull } from "@/components/action/action-list-full";
import { ActionFilters } from "@/components/action/action-filters";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string; memberId?: string }> };

export default async function ActionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: { status?: ActionItemStatusType; memberId?: string } = {};
  if (
    params.status &&
    ["TODO", "IN_PROGRESS", "DONE"].includes(params.status)
  ) {
    filters.status = params.status as ActionItemStatusType;
  }
  if (params.memberId) {
    filters.memberId = params.memberId;
  }

  const [actionItems, members] = await Promise.all([
    getActionItems(filters),
    getMembers(),
  ]);
  const memberList = members.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アクション一覧</h1>
      <Suspense>
        <ActionFilters members={memberList} />
      </Suspense>
      <ActionListFull actionItems={actionItems} />
    </div>
  );
}
