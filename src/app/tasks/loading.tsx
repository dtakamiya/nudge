import { ActionListSkeleton } from "@/components/action/action-list-skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function TasksLoading() {
  return (
    <div>
      <Breadcrumb items={[{ label: "ダッシュボード", href: "/" }, { label: "マイタスク" }]} />
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">マイタスク</h1>
      </div>
      <ActionListSkeleton />
    </div>
  );
}
