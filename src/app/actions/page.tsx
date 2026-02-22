import { Suspense } from "react";

import { ActionFilters } from "@/components/action/action-filters";
import { ActionListFull } from "@/components/action/action-list-full";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getActionItems } from "@/lib/actions/action-item-actions";
import { getMembers } from "@/lib/actions/member-actions";
import { getTags } from "@/lib/actions/tag-actions";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string; memberId?: string; tag?: string }> };

export default async function ActionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: { status?: ActionItemStatusType; memberId?: string; tagIds?: string[] } = {};
  if (params.status && ["TODO", "IN_PROGRESS", "DONE"].includes(params.status)) {
    filters.status = params.status as ActionItemStatusType;
  }
  if (params.memberId) {
    filters.memberId = params.memberId;
  }
  if (params.tag) {
    filters.tagIds = [params.tag];
  }

  const [actionItems, members, allTags] = await Promise.all([
    getActionItems(filters),
    getMembers(),
    getTags(),
  ]);
  const memberList = members.map((m) => ({ id: m.id, name: m.name }));
  const tagList = allTags.map((t) => ({ id: t.id, name: t.name, color: t.color }));

  // getActionItems は tags を含んでいるが型変換が必要
  const actionItemsWithTags = actionItems.map((item) => ({
    ...item,
    tags:
      "tags" in item
        ? (item.tags as Array<{ tag: { id: string; name: string; color: string } }>).map(
            (tt) => tt.tag,
          )
        : [],
  }));

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "アクション一覧" }]} />
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">アクション一覧</h1>
      <Suspense>
        <ActionFilters members={memberList} tags={tagList} />
      </Suspense>
      <ActionListFull actionItems={actionItemsWithTags} />
    </div>
  );
}
