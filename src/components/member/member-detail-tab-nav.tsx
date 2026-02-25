"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type MemberDetailTab = "timeline" | "history" | "actions" | "goals";

type Props = {
  memberId: string;
  currentTab: MemberDetailTab;
};

const TABS: { value: MemberDetailTab; label: string }[] = [
  { value: "timeline", label: "タイムライン" },
  { value: "history", label: "1on1履歴" },
  { value: "actions", label: "アクションアイテム" },
  { value: "goals", label: "目標" },
];

export function MemberDetailTabNav({ memberId, currentTab }: Props) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border mb-6">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          id={`tab-${tab.value}`}
          href={`/members/${memberId}?tab=${tab.value}`}
          role="tab"
          aria-selected={currentTab === tab.value}
          className={cn(
            "px-4 py-3 text-sm font-medium rounded-t-md transition-colors",
            currentTab === tab.value
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
