// src/components/layout/search-results.tsx
import { CheckSquare, MessageSquare, Tag, User } from "lucide-react";
import type React from "react";

import { extractSnippet, highlightText } from "@/lib/highlight";
import type { SearchResults } from "@/lib/types";
import { cn } from "@/lib/utils";

import { SearchItem, SearchSection } from "./search-item";

function buildContextSnippet(
  text: string | null | undefined,
  query: string,
): React.ReactNode | undefined {
  if (!text || !text.toLowerCase().includes(query.toLowerCase())) {
    return undefined;
  }
  return highlightText(extractSnippet(text, query), query);
}

export function SearchResultsDropdown({
  results,
  query,
  activeIndex,
  hasResults,
  onNavigate,
}: {
  results: SearchResults | null;
  query: string;
  activeIndex: number;
  hasResults: boolean;
  onNavigate: (href: string) => void;
}) {
  const membersCount = results?.members.length ?? 0;
  const topicsCount = results?.topics.length ?? 0;
  const actionsCount = results?.actionItems.length ?? 0;

  return (
    <div
      id="global-search-results"
      role="listbox"
      aria-label="検索結果"
      className={cn(
        "absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-md border border-border",
        "bg-popover shadow-lg animate-fade-in-up",
      )}
    >
      {hasResults && results ? (
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
                  onClick={() => onNavigate(`/members/${member.id}`)}
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
                  context={buildContextSnippet(topic.notes, query)}
                  query={query}
                  isActive={activeIndex === membersCount + i}
                  onClick={() =>
                    onNavigate(`/members/${topic.memberId}/meetings/${topic.meetingId}`)
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
                  context={buildContextSnippet(item.description, query)}
                  query={query}
                  isActive={activeIndex === membersCount + topicsCount + i}
                  onClick={() =>
                    item.meetingId
                      ? onNavigate(`/members/${item.memberId}/meetings/${item.meetingId}`)
                      : onNavigate(`/members/${item.memberId}`)
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
                  isActive={activeIndex === membersCount + topicsCount + actionsCount + i}
                  onClick={() => onNavigate(`/actions?tag=${tag.id}`)}
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
  );
}
