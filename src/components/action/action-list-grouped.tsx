"use client";

import { ChevronDown, ChevronRight, SquareCheck } from "lucide-react";
import { useState } from "react";

import { ActionListFull } from "@/components/action/action-list-full";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { GroupByType } from "@/lib/group-actions";
import { groupActionItems } from "@/lib/group-actions";

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

type Props = {
  actionItems: ActionItemRow[];
  groupBy: GroupByType;
  statusFilter?: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
};

export function ActionListGrouped({
  actionItems,
  groupBy,
  statusFilter,
  selectedIds,
  onToggleSelect,
}: Props) {
  const groups = groupActionItems(actionItems, groupBy);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  if (groupBy === "none") return null;
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={SquareCheck}
        title="アクションアイテムはありません"
        description="1on1でアクションアイテムを作成すると、ここに表示されます"
      />
    );
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.key);
        return (
          <div key={group.key}>
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="flex items-center gap-2 mb-3 text-left hover:opacity-70 transition-opacity w-full"
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="font-semibold tracking-tight">{group.label}</span>
              <Badge variant="secondary" className="text-xs">
                {group.items.length}
              </Badge>
            </button>
            {!isCollapsed && (
              <div className="ml-6">
                <ActionListFull
                  actionItems={group.items}
                  statusFilter={statusFilter}
                  selectedIds={selectedIds}
                  onToggleSelect={onToggleSelect}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
