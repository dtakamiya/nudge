import { Skeleton } from "@/components/ui/skeleton";

function ActionCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-md shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ActionListSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>

      {/* Filter bar */}
      <div className="mb-4 space-y-3">
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <ActionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
