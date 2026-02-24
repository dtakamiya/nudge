import { Skeleton } from "@/components/ui/skeleton";

function MemberTableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-8" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-14 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-20 rounded-md" />
      </td>
    </tr>
  );
}

export function MemberListSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Skeleton className="h-9 w-48 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-4 w-10 self-center" />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                名前
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                部署
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                最終1on1
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                未完了
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <MemberTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
