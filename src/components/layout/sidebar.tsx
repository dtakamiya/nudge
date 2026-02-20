"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, ListChecks, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/members/new", label: "メンバー追加", icon: UserPlus },
  { href: "/actions", label: "アクション一覧", icon: ListChecks },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-[oklch(0.65_0.17_70/0.1)] text-[oklch(0.55_0.15_60)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* モバイルトップバー */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[var(--sidebar)] border-b flex items-center px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-accent"
          aria-label="メニューを開く"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-3 text-lg font-semibold tracking-tight text-primary">Nudge</span>
      </div>

      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setIsOpen(false)}>
          <aside
            className="w-64 h-full bg-[var(--sidebar)] p-4 flex flex-col gap-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">
                Nudge
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent"
                aria-label="メニューを閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}

      {/* デスクトップサイドバー */}
      <aside className="hidden lg:flex w-64 border-r bg-[var(--sidebar)] p-4 flex-col gap-6 shrink-0">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">
          Nudge
        </Link>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}
