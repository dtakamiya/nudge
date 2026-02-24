import { Skeleton } from "@/components/ui/skeleton";

function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-l-4 border-l-muted bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-10 w-16" />
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-3 py-2">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function ActionRowSkeleton() {
  return (
    <div className="flex items-center gap-2 py-2">
      <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3.5 w-full max-w-[200px]" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function MemberRowSkeleton() {
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
        <Skeleton className="h-3.5 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20" />
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

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-40 mb-6" />

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>

      {/* Activity + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <ActivityRowSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <Skeleton className="h-4 w-24 mb-4" />
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <ActionRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-12" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-14" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
              <th className="px-4 py-3 text-left" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <MemberRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
