"use client";

import { CheckSquare, MessageSquare, Search, Tag, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { searchAll } from "@/lib/actions/search-actions";
import { extractSnippet, highlightText } from "@/lib/highlight";
import type { SearchResults } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setResults(null);
    setActiveIndex(-1);
  }, []);

  // Cmd+K / Ctrl+K でフォーカス
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // クリック外れで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < MIN_QUERY_LENGTH) {
      closeDropdown();
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await searchAll(value);
        if (result.success) {
          setResults(result.data);
          setIsOpen(true);
        }
      });
    }, DEBOUNCE_MS);
  };

  // 全アイテムのフラットなリストを構築してキーボードナビゲーションに使用
  const allItems = results
    ? [
        ...results.members.map((m) => ({
          id: `search-member-${m.id}`,
          href: `/members/${m.id}`,
        })),
        ...results.topics.map((t) => ({
          id: `search-topic-${t.id}`,
          href: `/members/${t.memberId}/meetings/${t.meetingId}`,
        })),
        ...results.actionItems.map((a) => ({
          id: `search-action-${a.id}`,
          href: a.meetingId
            ? `/members/${a.memberId}/meetings/${a.meetingId}`
            : `/members/${a.memberId}`,
        })),
        ...results.tags.map((tag) => ({
          id: `search-tag-${tag.id}`,
          href: `/actions?tag=${tag.id}`,
        })),
      ]
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      closeDropdown();
      setQuery("");
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? allItems.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = allItems[activeIndex];
      if (item) {
        handleNavigate(item.href);
      }
    }
  };

  const handleNavigate = (href: string) => {
    closeDropdown();
    setQuery("");
    router.push(href);
  };

  const hasResults =
    results &&
    (results.members.length > 0 ||
      results.topics.length > 0 ||
      results.actionItems.length > 0 ||
      results.tags.length > 0);

  const activeDescendant =
    activeIndex >= 0 && allItems[activeIndex] ? allItems[activeIndex].id : undefined;

  return (
    <div ref={containerRef} className="relative">
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
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
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
            onClick={() => {
              setQuery("");
              closeDropdown();
              inputRef.current?.focus();
            }}
            aria-label="検索をクリア"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="検索結果"
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-md border border-border",
            "bg-popover shadow-lg animate-fade-in-up",
          )}
        >
          {hasResults ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.members.length > 0 && (
                <SearchSection label="メンバー">
                  {results.members.map((member, i) => (
                    <SearchItem
                      key={member.id}
                      id={`search-member-${member.id}`}
                      icon={<User size={12} />}
                      primary={member.name}
                      secondary={[member.department, member.position].filter(Boolean).join(" · ")}
                      query={query}
                      isActive={activeIndex === i}
                      onClick={() => handleNavigate(`/members/${member.id}`)}
                    />
                  ))}
                </SearchSection>
              )}
              {results.topics.length > 0 && (
                <SearchSection label="話題">
                  {results.topics.map((topic, i) => (
                    <SearchItem
                      key={topic.id}
                      id={`search-topic-${topic.id}`}
                      icon={<MessageSquare size={12} />}
                      primary={topic.title}
                      secondary={topic.memberName}
                      context={
                        topic.notes && topic.notes.toLowerCase().includes(query.toLowerCase())
                          ? highlightText(extractSnippet(topic.notes, query), query)
                          : undefined
                      }
                      query={query}
                      isActive={activeIndex === results.members.length + i}
                      onClick={() =>
                        handleNavigate(`/members/${topic.memberId}/meetings/${topic.meetingId}`)
                      }
                    />
                  ))}
                </SearchSection>
              )}
              {results.actionItems.length > 0 && (
                <SearchSection label="アクションアイテム">
                  {results.actionItems.map((item, i) => (
                    <SearchItem
                      key={item.id}
                      id={`search-action-${item.id}`}
                      icon={<CheckSquare size={12} />}
                      primary={item.title}
                      secondary={item.memberName}
                      context={
                        item.description &&
                        item.description.toLowerCase().includes(query.toLowerCase())
                          ? highlightText(extractSnippet(item.description, query), query)
                          : undefined
                      }
                      query={query}
                      isActive={activeIndex === results.members.length + results.topics.length + i}
                      onClick={() =>
                        item.meetingId
                          ? handleNavigate(`/members/${item.memberId}/meetings/${item.meetingId}`)
                          : handleNavigate(`/members/${item.memberId}`)
                      }
                    />
                  ))}
                </SearchSection>
              )}
              {results.tags.length > 0 && (
                <SearchSection label="タグ">
                  {results.tags.map((tag, i) => (
                    <SearchItem
                      key={tag.id}
                      id={`search-tag-${tag.id}`}
                      icon={<Tag size={12} />}
                      primary={tag.name}
                      query={query}
                      isActive={
                        activeIndex ===
                        results.members.length +
                          results.topics.length +
                          results.actionItems.length +
                          i
                      }
                      onClick={() => handleNavigate(`/actions?tag=${tag.id}`)}
                    />
                  ))}
                </SearchSection>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              結果が見つかりませんでした
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function SearchItem({
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
