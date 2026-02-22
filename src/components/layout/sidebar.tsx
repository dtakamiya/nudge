"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, ListChecks, BarChart2, Menu, X } from "lucide-react";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Separator } from "@/components/ui/separator";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";

type MemberItem = {
  readonly id: string;
  readonly name: string;
};

type SidebarProps = {
  readonly members?: MemberItem[];
  readonly actionCount?: number;
};

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/members/new", label: "メンバー追加", icon: UserPlus },
  { href: "/actions", label: "アクション一覧", icon: ListChecks },
  { href: "/analytics", label: "ミーティング分析", icon: BarChart2 },
];

function NavLinks({
  pathname,
  actionCount,
  onNavigate,
}: {
  readonly pathname: string;
  readonly actionCount?: number;
  readonly onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const badge = item.href === "/actions" && actionCount != null && actionCount > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {badge && (
              <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                {actionCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MemberQuickList({
  members,
  onNavigate,
}: {
  readonly members: MemberItem[];
  readonly onNavigate?: () => void;
}) {
  if (members.length === 0) return null;

  return (
    <div>
      <Separator className="mb-4" />
      <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        メンバー
      </p>
      <nav className="flex flex-col gap-0.5">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150"
          >
            <AvatarInitial name={member.name} size="sm" />
            <span className="truncate">{member.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ members = [], actionCount }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* モバイルトップバー */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--sidebar)] border-b flex items-center px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-accent transition-colors duration-150"
          aria-label="メニューを開く"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-3 text-lg font-semibold tracking-tight text-foreground">Nudge</span>
      </div>

      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/20 transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
        >
          <aside
            className="w-56 h-full bg-[var(--sidebar)] p-4 flex flex-col gap-6 shadow-lg transition-transform duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
                Nudge
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors duration-150"
                aria-label="メニューを閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <GlobalSearch />
            <NavLinks
              pathname={pathname}
              actionCount={actionCount}
              onNavigate={() => setIsOpen(false)}
            />
            <MemberQuickList members={members} onNavigate={() => setIsOpen(false)} />
            <div className="mt-auto pt-4 border-t border-border">
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}

      {/* デスクトップサイドバー */}
      <aside className="hidden lg:flex w-56 border-r bg-[var(--sidebar)] p-4 flex-col gap-6 shrink-0">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Nudge
        </Link>
        <GlobalSearch />
        <NavLinks pathname={pathname} actionCount={actionCount} />
        <MemberQuickList members={members} />
        <div className="mt-auto pt-4 border-t border-border">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
