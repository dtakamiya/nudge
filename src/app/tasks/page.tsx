import { ClipboardCheck } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { TaskDateGroup } from "@/components/task/task-date-group";
import { Badge } from "@/components/ui/badge";
import { getMyTasks } from "@/lib/actions/action-item-actions";
import { groupTasksByDueDate } from "@/lib/group-tasks";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    memberId?: string;
  }>;
};

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams;

  const items = await getMyTasks({
    memberId: params.memberId,
  });

  const itemsWithTags = items.map((item) => ({
    ...item,
    tags: item.tags.map((tt) => tt.tag),
  }));

  const groups = groupTasksByDueDate(itemsWithTags);
  const totalCount = items.length;
  const overdueCount = groups.find((g) => g.key === "overdue")?.items.length ?? 0;

  return (
    <div className="animate-fade-in-up">
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "マイタスク" }]} />
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">マイタスク</h1>
        {overdueCount > 0 ? (
          <Badge variant="destructive" className="text-sm">
            {overdueCount} 件超過
          </Badge>
        ) : totalCount > 0 ? (
          <Badge variant="secondary" className="text-sm">
            {totalCount} 件
          </Badge>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        未完了のアクションアイテム（TODO・進行中）を期限別に表示しています。
      </p>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">すべて完了しています！</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            未完了のアクションアイテムはありません
          </p>
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <TaskDateGroup key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
