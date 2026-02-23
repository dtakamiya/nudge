"use client";

import { Clock } from "lucide-react";

import { useElapsedTime } from "@/hooks/use-elapsed-time";

type Props = {
  startedAt: Date;
};

export function ElapsedTimer({ startedAt }: Props) {
  const { formatted } = useElapsedTime(startedAt);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
      <Clock className="h-4 w-4" />
      <span className="font-mono">{formatted}</span>
    </div>
  );
}
