import { CheckCircle } from "lucide-react";

import { ActionListCompact } from "@/components/action/action-list-compact";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date } | null;
};

type Props = {
  readonly pendingActionItems: ActionItemRow[];
};

export function MemberQuickActions({ pendingActionItems }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">クイックアクション</h2>
        {pendingActionItems.length > 0 && (
          <Badge variant="status-todo">{pendingActionItems.length}</Badge>
        )}
      </div>
      {pendingActionItems.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="未完了のアクションアイテムはありません"
          size="compact"
        />
      ) : (
        <ActionListCompact actionItems={pendingActionItems} />
      )}
    </div>
  );
}
