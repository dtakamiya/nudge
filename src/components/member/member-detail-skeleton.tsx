import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-l-4 border-l-muted bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

function MeetingCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function MemberDetailSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Meeting history */}
      <Skeleton className="h-5 w-20 mb-3 mt-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <MeetingCardSkeleton key={i} />
        ))}
      </div>

      {/* Separator */}
      <div className="my-6 border-t" />

      {/* Action items */}
      <Skeleton className="h-5 w-36 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
