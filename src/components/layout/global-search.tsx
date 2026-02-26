"use client";

import { useGlobalSearch } from "@/hooks/use-global-search";

import { SearchInput } from "./search-input";
import { SearchResultsDropdown } from "./search-results";

export function GlobalSearch() {
  const {
    query,
    results,
    isOpen,
    activeIndex,
    hasResults,
    activeDescendant,
    inputRef,
    containerRef,
    handleQueryChange,
    handleKeyDown,
    handleNavigate,
  } = useGlobalSearch();

  const handleClear = () => {
    handleQueryChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <SearchInput
        query={query}
        isOpen={isOpen}
        activeDescendant={activeDescendant}
        inputRef={inputRef}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
      />
      {isOpen && (
        <SearchResultsDropdown
          results={results}
          query={query}
          activeIndex={activeIndex}
          hasResults={hasResults}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
