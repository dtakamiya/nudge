"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type Tab = "timeline" | "history" | "actions";

type Props = {
  memberId: string;
  currentTab: Tab;
};

const TABS: { value: Tab; label: string }[] = [
  { value: "timeline", label: "タイムライン" },
  { value: "history", label: "1on1履歴" },
  { value: "actions", label: "アクションアイテム" },
];

export function MemberDetailTabNav({ memberId, currentTab }: Props) {
  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/members/${memberId}?tab=${tab.value}`}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
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
