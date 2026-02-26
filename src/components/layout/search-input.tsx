// src/components/layout/search-input.tsx
import { Search, X } from "lucide-react";
import type React from "react";
import type { RefObject } from "react";

import { cn } from "@/lib/utils";

export function SearchInput({
  query,
  isOpen,
  activeDescendant,
  inputRef,
  onChange,
  onKeyDown,
  onClear,
}: {
  query: string;
  isOpen: boolean;
  activeDescendant: string | undefined;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={14}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="検索..."
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendant}
        aria-label="グローバル検索"
        className={cn(
          "w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-8 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          "transition-colors",
        )}
      />
      {query && (
        <button
          type="button"
          onClick={onClear}
          aria-label="検索をクリア"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
