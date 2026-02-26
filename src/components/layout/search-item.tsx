// src/components/layout/search-item.tsx
import type React from "react";

import { highlightText } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function SearchSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export function SearchItem({
  id,
  icon,
  primary,
  secondary,
  context,
  query,
  isActive,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  context?: React.ReactNode;
  query: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      role="option"
      aria-selected={isActive ?? false}
      className={cn(
        "flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "cursor-pointer transition-colors",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="truncate font-medium">{highlightText(primary, query)}</div>
        {secondary && <div className="truncate text-xs text-muted-foreground">{secondary}</div>}
        {context && (
          <div
            data-testid="search-context"
            className="truncate text-xs italic text-muted-foreground"
          >
            {context}
          </div>
        )}
      </div>
    </button>
  );
}
