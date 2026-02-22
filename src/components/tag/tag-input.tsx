"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { getTagSuggestions } from "@/lib/actions/tag-actions";
import { cn } from "@/lib/utils";

import { TagBadge } from "./tag-badge";

const DEBOUNCE_MS = 300;

type TagData = {
  id?: string;
  name: string;
  color?: string;
};

type TagInputProps = {
  selectedTags: TagData[];
  onTagsChange: (tags: TagData[]) => void;
  placeholder?: string;
};

type Suggestion = {
  id: string;
  name: string;
  color: string;
};

export function TagInput({
  selectedTags,
  onTagsChange,
  placeholder = "タグを追加...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSuggestions([]);
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

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await getTagSuggestions(value);
        // 既に選択済みのタグを除外（id または name で判定）
        const filtered = results.filter(
          (s) => !selectedTags.some((t) => (t.id && t.id === s.id) || t.name === s.name),
        );
        setSuggestions(filtered);
        setIsOpen(true);
      });
    }, DEBOUNCE_MS);
  };

  const addTag = (tag: TagData) => {
    onTagsChange([...selectedTags, tag]);
    setInputValue("");
    closeDropdown();
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    const updated = selectedTags.filter((_, i) => i !== index);
    onTagsChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      closeDropdown();
      return;
    }

    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      // 入力値と完全一致するサジェストがある場合はそれを使用
      const exactMatch = suggestions.find(
        (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase(),
      );
      if (exactMatch) {
        addTag(exactMatch);
      } else {
        // 新規タグとして追加
        addTag({ name: inputValue.trim() });
      }
    }
  };

  // 入力値と完全一致するサジェストがあるか確認
  const hasExactMatch =
    inputValue.trim().length > 0 &&
    suggestions.some((s) => s.name.toLowerCase() === inputValue.trim().toLowerCase());

  const showNewTagOption = inputValue.trim().length > 0 && !hasExactMatch;

  return (
    <div ref={containerRef} className="relative">
      {/* 選択済みタグ */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTags.map((tag, index) => (
            <TagBadge
              key={tag.id ?? tag.name}
              name={tag.name}
              color={tag.color}
              size="sm"
              onRemove={() => removeTag(index)}
            />
          ))}
        </div>
      )}

      {/* 入力フィールド */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          "transition-colors",
        )}
      />

      {/* サジェストドロップダウン */}
      {isOpen && (suggestions.length > 0 || showNewTagOption) && (
        <div
          role="listbox"
          aria-label="タグの候補"
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-border",
            "bg-popover shadow-lg animate-fade-in-up",
          )}
        >
          <ul className="max-h-48 overflow-y-auto py-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "cursor-pointer transition-colors",
                  )}
                >
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: suggestion.color }}
                    aria-hidden="true"
                  />
                  {suggestion.name}
                </button>
              </li>
            ))}
            {showNewTagOption && (
              <li role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => addTag({ name: inputValue.trim() })}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "cursor-pointer transition-colors text-muted-foreground",
                  )}
                >
                  <span className="text-primary">+</span>
                  &ldquo;{inputValue.trim()}&rdquo; を新規作成
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
