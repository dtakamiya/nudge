"use client";

import { ActionListFull } from "@/components/action/action-list-full";
import { ActionListGrouped } from "@/components/action/action-list-grouped";
import { ActionPagination } from "@/components/action/action-pagination";
import { BulkActionBar } from "@/components/action/bulk-action-bar";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import type { GroupByType } from "@/lib/group-actions";

type TagData = {
  id: string;
  name: string;
  color: string;
};

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
  tags?: TagData[];
};

type SearchParams = {
  status?: string;
  memberId?: string;
  tag?: string;
  q?: string;
  dateFilter?: string;
  sort?: string;
  page?: string;
  groupBy?: string;
};

type Props = {
  actionItems: ActionItemRow[];
  groupBy: GroupByType;
  isGrouped: boolean;
  statusFilter?: string;
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
  hasMembers: boolean;
  hasFilter: boolean;
};

export function ActionsBulkContainer({
  actionItems,
  groupBy,
  isGrouped,
  statusFilter,
  currentPage,
  totalPages,
  searchParams,
  hasMembers,
  hasFilter,
}: Props) {
  const { selectedIds, toggleItem, clearAll } = useBulkSelection();

  return (
    <>
      {isGrouped ? (
        <ActionListGrouped
          actionItems={actionItems}
          groupBy={groupBy}
          statusFilter={statusFilter}
          selectedIds={selectedIds}
          onToggleSelect={toggleItem}
        />
      ) : (
        <>
          <ActionListFull
            actionItems={actionItems}
            statusFilter={statusFilter}
            selectedIds={selectedIds}
            onToggleSelect={toggleItem}
            hasMembers={hasMembers}
            hasFilter={hasFilter}
          />
          <ActionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </>
      )}
      <BulkActionBar selectedIds={selectedIds} onClearAll={clearAll} />
    </>
  );
}
