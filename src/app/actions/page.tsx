import { Suspense } from "react";

import { ActionFilters } from "@/components/action/action-filters";
import { ActionListSkeleton } from "@/components/action/action-list-skeleton";
import { ActionsBulkContainer } from "@/components/action/actions-bulk-container";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { FilterResultAnnouncer } from "@/components/ui/filter-result-announcer";
import { getActionItems } from "@/lib/actions/action-item-actions";
import { getMembers } from "@/lib/actions/member-actions";
import { getTags } from "@/lib/actions/tag-actions";
import type { GroupByType } from "@/lib/group-actions";
import type { DateFilterType, SortByType } from "@/lib/types";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

export const dynamic = "force-dynamic";

const DATE_FILTERS: DateFilterType[] = ["all", "overdue", "this-week", "this-month", "no-date"];
const SORT_OPTIONS: SortByType[] = ["dueDate", "createdAt", "updatedAt", "memberName"];
const GROUP_BY_OPTIONS: GroupByType[] = ["none", "member", "dueDate", "tag"];
const PER_PAGE = 20;
const PER_PAGE_GROUPED = 1000;

type Props = {
  searchParams: Promise<{
    status?: string;
    memberId?: string;
    tag?: string;
    q?: string;
    dateFilter?: string;
    sort?: string;
    page?: string;
    groupBy?: string;
  }>;
};

export default async function ActionsPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters: {
    status?: ActionItemStatusType;
    memberId?: string;
    tagIds?: string[];
    keyword?: string;
    dateFilter?: DateFilterType;
    sortBy?: SortByType;
    page?: number;
    perPage?: number;
  } = {};

  if (params.status && ["TODO", "IN_PROGRESS", "DONE"].includes(params.status)) {
    filters.status = params.status as ActionItemStatusType;
  }
  if (params.memberId) {
    filters.memberId = params.memberId;
  }
  if (params.tag) {
    filters.tagIds = [params.tag];
  }
  if (params.q) {
    filters.keyword = params.q;
  }
  if (params.dateFilter && DATE_FILTERS.includes(params.dateFilter as DateFilterType)) {
    filters.dateFilter = params.dateFilter as DateFilterType;
  }
  if (params.sort && SORT_OPTIONS.includes(params.sort as SortByType)) {
    filters.sortBy = params.sort as SortByType;
  }

  const groupBy: GroupByType =
    params.groupBy && GROUP_BY_OPTIONS.includes(params.groupBy as GroupByType)
      ? (params.groupBy as GroupByType)
      : "none";

  const isGrouped = groupBy !== "none";
  const currentPage = isGrouped ? 1 : Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  filters.page = currentPage;
  filters.perPage = isGrouped ? PER_PAGE_GROUPED : PER_PAGE;

  const [{ items: actionItems, total, totalPages }, members, allTags] = await Promise.all([
    getActionItems(filters),
    getMembers(),
    getTags(),
  ]);
  const memberList = members.map((m) => ({ id: m.id, name: m.name }));
  const tagList = allTags.map((t) => ({ id: t.id, name: t.name, color: t.color }));

  const actionItemsWithTags = actionItems.map((item) => ({
    ...item,
    tags: item.tags.map((tt) => tt.tag),
  }));

  const hasFilter =
    !!filters.status ||
    !!filters.memberId ||
    !!filters.tagIds ||
    !!filters.keyword ||
    (!!filters.dateFilter && filters.dateFilter !== "all");

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "アクション一覧" }]} />
      <FilterResultAnnouncer
        count={total}
        itemLabel="アクション"
        emptyMessage="該当するアクションが見つかりませんでした"
      />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">アクション一覧</h1>
        {hasFilter ? (
          <Badge variant="secondary" className="text-sm">
            {total} 件
          </Badge>
        ) : (
          <Badge variant="outline" className="text-sm text-muted-foreground">
            {total} 件
          </Badge>
        )}
      </div>
      <Suspense>
        <ActionFilters members={memberList} tags={tagList} />
      </Suspense>
      <Suspense fallback={<ActionListSkeleton />}>
        <ActionsBulkContainer
          actionItems={actionItemsWithTags}
          groupBy={groupBy}
          isGrouped={isGrouped}
          statusFilter={filters.status}
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={params}
          hasMembers={members.length > 0}
          hasFilter={hasFilter}
        />
      </Suspense>
    </div>
  );
}
