"use client";

import {
  BarChart2,
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Separator } from "@/components/ui/separator";
import { useFocusMode } from "@/hooks/use-focus-mode";

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
  { href: "/members", label: "メンバー一覧", icon: Users },
  { href: "/members/new", label: "メンバー追加", icon: UserPlus },
  { href: "/tasks", label: "マイタスク", icon: ClipboardCheck },
  { href: "/actions", label: "アクション一覧", icon: ListChecks },
  { href: "/analytics", label: "ミーティング分析", icon: BarChart2 },
  { href: "/settings", label: "設定", icon: Settings },
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
        const isActive =
          item.href === "/" || item.href === "/members"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
        const badge = item.href === "/actions" && actionCount != null && actionCount > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors duration-150 ${
              isActive
                ? "bg-primary/10 text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {badge && (
              <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
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
            className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150"
          >
            <AvatarInitial name={member.name} size="sm" />
            <span className="truncate">{member.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sidebar({ members = [], actionCount }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { isFocusMode } = useFocusMode();

  useEffect(() => {
    if (!isOpen) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusable = sidebar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    if (focusable.length > 0) focusable[0].focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const elements = Array.from(sidebar!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* モバイルトップバー */}
      <div
        className={`lg:hidden print:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar border-b flex items-center px-4 transition-all duration-300 ease-in-out ${
          isFocusMode ? "-translate-y-full opacity-0 h-0 overflow-hidden" : ""
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 rounded-lg hover:bg-accent transition-colors duration-150"
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
            ref={sidebarRef}
            role="dialog"
            aria-modal="true"
            aria-label="ナビゲーションメニュー"
            className="w-56 h-full bg-sidebar p-4 flex flex-col gap-6 shadow-lg transition-transform duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
                Nudge
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-lg hover:bg-accent transition-colors duration-150"
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
            <div className="mt-auto pt-4 border-t border-border space-y-2">
              <p className="px-3 py-1 text-xs text-muted-foreground">
                <kbd className="font-mono font-medium">?</kbd> ショートカット一覧
              </p>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}

      {/* デスクトップサイドバー */}
      <aside
        className={`hidden lg:flex print:hidden w-56 border-r bg-sidebar p-4 flex-col gap-6 shrink-0 transition-all duration-300 ease-in-out ${
          isFocusMode ? "w-0 -translate-x-full overflow-hidden p-0" : ""
        }`}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Nudge
        </Link>
        <GlobalSearch />
        <NavLinks pathname={pathname} actionCount={actionCount} />
        <MemberQuickList members={members} />
        <div className="mt-auto pt-4 border-t border-border space-y-2">
          <p className="px-3 py-1 text-xs text-muted-foreground">
            <kbd className="font-mono font-medium">?</kbd> ショートカット一覧
          </p>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
