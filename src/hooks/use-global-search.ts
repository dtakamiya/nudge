"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchAll } from "@/lib/actions/search-actions";
import type { SearchResults } from "@/lib/types";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface GlobalSearchItem {
  id: string;
  href: string;
}

export function useGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
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

  // アンマウント時にデバウンスタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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

    debounceRef.current = setTimeout(async () => {
      const result = await searchAll(value);
      if (result.success) {
        setResults(result.data);
        setIsOpen(true);
      }
    }, DEBOUNCE_MS);
  };

  // 全アイテムのフラットリスト（キーボードナビゲーション用）
  const allItems: GlobalSearchItem[] = results
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
    results !== null &&
    (results.members.length > 0 ||
      results.topics.length > 0 ||
      results.actionItems.length > 0 ||
      results.tags.length > 0);

  const activeDescendant =
    activeIndex >= 0 && allItems[activeIndex] ? allItems[activeIndex].id : undefined;

  return {
    query,
    results,
    isOpen,
    activeIndex,
    hasResults,
    activeDescendant,
    allItems,
    inputRef,
    containerRef,
    handleQueryChange,
    handleKeyDown,
    handleNavigate,
    closeDropdown,
  };
}
