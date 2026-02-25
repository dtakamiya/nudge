"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  status: SaveStatus;
  onRetry?: () => void;
  onIdle?: () => void;
};

export function AutoSaveIndicator({ status, onRetry, onIdle }: Props) {
  useEffect(() => {
    if (status !== "saved") return;

    const timer = setTimeout(() => {
      onIdle?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [status, onIdle]);

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-opacity duration-300",
        status === "saving" && "text-muted-foreground",
        status === "saved" && "text-green-600 dark:text-green-400",
        status === "error" && "text-destructive",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>保存中...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>保存済み</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>保存に失敗しました</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1.5 py-0.5 text-xs text-destructive hover:text-destructive"
              onClick={onRetry}
            >
              再試行
            </Button>
          )}
        </>
      )}
    </div>
  );
}
