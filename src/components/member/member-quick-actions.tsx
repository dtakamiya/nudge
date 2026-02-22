import { Badge } from "@/components/ui/badge";
import { ActionListCompact } from "@/components/action/action-list-compact";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
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
        <p className="text-muted-foreground py-4">未完了のアクションアイテムはありません</p>
      ) : (
        <ActionListCompact actionItems={pendingActionItems} />
      )}
    </div>
  );
}
