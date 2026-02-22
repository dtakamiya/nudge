import { Suspense } from "react";

import { ActionFilters } from "@/components/action/action-filters";
import { ActionListFull } from "@/components/action/action-list-full";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getActionItems } from "@/lib/actions/action-item-actions";
import { getMembers } from "@/lib/actions/member-actions";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string; memberId?: string }> };

export default async function ActionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: { status?: ActionItemStatusType; memberId?: string } = {};
  if (params.status && ["TODO", "IN_PROGRESS", "DONE"].includes(params.status)) {
    filters.status = params.status as ActionItemStatusType;
  }
  if (params.memberId) {
    filters.memberId = params.memberId;
  }

  const [actionItems, members] = await Promise.all([getActionItems(filters), getMembers()]);
  const memberList = members.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "アクション一覧" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">アクション一覧</h1>
      <Suspense>
        <ActionFilters members={memberList} />
      </Suspense>
      <ActionListFull actionItems={actionItems} />
    </div>
  );
}
