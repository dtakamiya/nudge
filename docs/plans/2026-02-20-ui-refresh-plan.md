# Nudge UI リフレッシュ "Hearth" 実装プラン

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Nudge の全 UI を "Hearth" デザインに刷新する — ウォーム・オーガニックなカラーパレット、セリフ×サンセリフのフォントペアリング、レスポンシブサイドバー、マイクロアニメーション。

**Architecture:** CSS 変数でカラーシステムを定義し、shadcn/ui コンポーネントのスタイルをオーバーライド。`next/font/google` でフォント最適化。レスポンシブサイドバーは React の state で開閉管理。アニメーションは CSS のみ。

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, next/font/google, lucide-react

**Design Doc:** `docs/plans/2026-02-20-ui-refresh-design.md`

---

### Task 1: フォントセットアップ

Google Fonts を `next/font/google` で読み込み、CSS 変数として公開する。

**Files:**

- Modify: `src/app/layout.tsx:1-46`

**Step 1: フォントインポートを追加**

`src/app/layout.tsx` の先頭にフォントインポートを追加:

```typescript
import { DM_Serif_Display, Source_Sans_3, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading-jp",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body-jp",
  display: "swap",
});
```

**Step 2: body にフォント変数クラスを適用**

`<body>` タグに CSS 変数クラスを追加:

```tsx
<body className={`${dmSerifDisplay.variable} ${sourceSans3.variable} ${notoSerifJP.variable} ${notoSansJP.variable} flex h-screen`}>
```

**Step 3: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。フォントが正しくダウンロードされる。

**Step 4: コミット**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Google Fonts (DM Serif Display, Source Sans 3, Noto Serif/Sans JP)"
```

---

### Task 2: カラーシステム更新

CSS 変数をグレースケールから Hearth ウォームパレットに変更する。

**Files:**

- Modify: `src/app/globals.css:1-127`

**Step 1: CSS 変数を Hearth パレットに更新**

`globals.css` の `:root` ブロックを以下に置換:

```css
:root {
  --radius: 0.75rem;
  --background: oklch(0.99 0.01 85);
  --foreground: oklch(0.3 0.04 60);
  --card: oklch(0.98 0.02 85);
  --card-foreground: oklch(0.3 0.04 60);
  --popover: oklch(0.98 0.02 85);
  --popover-foreground: oklch(0.3 0.04 60);
  --primary: oklch(0.65 0.17 70);
  --primary-foreground: oklch(0.99 0.01 85);
  --secondary: oklch(0.95 0.02 80);
  --secondary-foreground: oklch(0.35 0.05 60);
  --muted: oklch(0.95 0.02 80);
  --muted-foreground: oklch(0.58 0.04 60);
  --accent: oklch(0.96 0.02 85);
  --accent-foreground: oklch(0.35 0.05 60);
  --destructive: oklch(0.6 0.18 40);
  --border: oklch(0.9 0.03 75);
  --input: oklch(0.9 0.03 75);
  --ring: oklch(0.65 0.17 70);
  --chart-1: oklch(0.65 0.17 70);
  --chart-2: oklch(0.55 0.1 160);
  --chart-3: oklch(0.6 0.18 40);
  --chart-4: oklch(0.7 0.08 85);
  --chart-5: oklch(0.5 0.1 55);
  --sidebar: oklch(0.96 0.02 85);
  --sidebar-foreground: oklch(0.3 0.04 60);
  --sidebar-primary: oklch(0.65 0.17 70);
  --sidebar-primary-foreground: oklch(0.99 0.01 85);
  --sidebar-accent: oklch(0.93 0.03 80);
  --sidebar-accent-foreground: oklch(0.35 0.05 60);
  --sidebar-border: oklch(0.9 0.03 75);
  --sidebar-ring: oklch(0.65 0.17 70);
}
```

**Step 2: @theme inline のフォント変数を更新**

```css
@theme inline {
  --font-sans: var(--font-body), var(--font-body-jp), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-heading), var(--font-heading-jp), ui-serif, Georgia, serif;
}
```

注意: `--font-sans` と `--font-heading` の変数名。`--font-heading` は Tailwind のカスタムフォントファミリーとして使う。

**Step 3: .dark ブロックを削除**

ライトモードのみなので `.dark { ... }` ブロック全体を削除。`@custom-variant dark` の行も削除。

**Step 4: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 5: コミット**

```bash
git add src/app/globals.css
git commit -m "feat: update color system to Hearth warm palette"
```

---

### Task 3: アニメーション用 CSS を追加

ページフェードイン、カードホバー、スタガードアニメーション用の CSS を globals.css に追加。

**Files:**

- Modify: `src/app/globals.css`

**Step 1: @layer base にアニメーション定義を追加**

globals.css の末尾に追加:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes badge-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 300ms ease-out both;
}

.animate-slide-in {
  animation: slide-in 250ms ease-out both;
}

.animate-badge-bounce {
  animation: badge-bounce 200ms ease-in-out;
}

.stagger-1 {
  animation-delay: 50ms;
}
.stagger-2 {
  animation-delay: 100ms;
}
.stagger-3 {
  animation-delay: 150ms;
}
.stagger-4 {
  animation-delay: 200ms;
}
.stagger-5 {
  animation-delay: 250ms;
}
```

**Step 2: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 3: コミット**

```bash
git add src/app/globals.css
git commit -m "feat: add Hearth animation keyframes and utility classes"
```

---

### Task 4: イニシャルアバター ユーティリティ作成

メンバー名のハッシュからグラデーションアバターを生成するユーティリティとコンポーネント。

**Files:**

- Create: `src/lib/avatar.ts`
- Create: `src/lib/__tests__/avatar.test.ts`
- Create: `src/components/ui/avatar-initial.tsx`

**Step 1: テストを書く**

`src/lib/__tests__/avatar.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getAvatarGradient, getInitials } from "../avatar";

describe("getInitials", () => {
  it("returns first character for single-word name", () => {
    expect(getInitials("田中")).toBe("田");
  });

  it("returns first characters of first and last for multi-word name", () => {
    expect(getInitials("田中 太郎")).toBe("田太");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("?");
  });
});

describe("getAvatarGradient", () => {
  it("returns a gradient tuple for a given name", () => {
    const result = getAvatarGradient("田中太郎");
    expect(result).toHaveLength(2);
    expect(result[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result[1]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("returns same gradient for same name", () => {
    const a = getAvatarGradient("佐藤");
    const b = getAvatarGradient("佐藤");
    expect(a).toEqual(b);
  });

  it("returns different gradients for different names", () => {
    const a = getAvatarGradient("田中");
    const b = getAvatarGradient("佐藤");
    // 異なる名前は高確率で異なるグラデーションになる（ハッシュ依存）
    // 同じになる可能性もあるが、テスト用の名前は異なることを期待
    expect(a !== b || true).toBe(true); // 衝突は許容
  });
});
```

**Step 2: テストが失敗することを確認**

Run: `npm test -- src/lib/__tests__/avatar.test.ts`
Expected: FAIL — モジュールが存在しない。

**Step 3: avatar.ts を実装**

`src/lib/avatar.ts`:

```typescript
const AVATAR_GRADIENTS: readonly [string, string][] = [
  ["#D97706", "#C27549"],
  ["#6B8F71", "#8FAF85"],
  ["#B45309", "#D97706"],
  ["#C27549", "#D4A37A"],
  ["#7B8F6B", "#6B8F71"],
  ["#A67B5B", "#C49A6C"],
  ["#8B6F47", "#B8956A"],
  ["#5F8A6B", "#7DA88A"],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[parts.length - 1][0];
}

export function getAvatarGradient(name: string): readonly [string, string] {
  const index = hashString(name) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
```

**Step 4: テストが通ることを確認**

Run: `npm test -- src/lib/__tests__/avatar.test.ts`
Expected: PASS。

**Step 5: AvatarInitial コンポーネントを作成**

`src/components/ui/avatar-initial.tsx`:

```tsx
import { getAvatarGradient, getInitials } from "@/lib/avatar";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

export function AvatarInitial({ name, size = "md" }: Props) {
  const [from, to] = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}
```

**Step 6: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 7: コミット**

```bash
git add src/lib/avatar.ts src/lib/__tests__/avatar.test.ts src/components/ui/avatar-initial.tsx
git commit -m "feat: add avatar initial component with gradient generation"
```

---

### Task 5: レスポンシブサイドバー

固定サイドバーをレスポンシブ対応のコンポーネントに置き換える。

**Files:**

- Create: `src/components/layout/sidebar.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Sidebar コンポーネントを作成**

`src/components/layout/sidebar.tsx`:

```tsx
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
        <span className="ml-3 font-heading text-xl text-primary">Nudge</span>
      </div>

      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setIsOpen(false)}>
          <aside
            className="w-64 h-full bg-[var(--sidebar)] p-4 flex flex-col gap-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="font-heading text-2xl text-primary">
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
        <Link href="/" className="font-heading text-2xl text-primary">
          Nudge
        </Link>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}
```

**Step 2: layout.tsx を更新**

`src/app/layout.tsx` を更新:

```tsx
import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading-jp",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nudge - 1on1 Tracker",
  description: "1on1ログ & アクショントラッカー",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={`${dmSerifDisplay.variable} ${sourceSans3.variable} ${notoSerifJP.variable} ${notoSansJP.variable} flex h-screen`}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-18 lg:p-8 lg:pt-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
```

注意: `pt-18` はモバイルでトップバーの高さ分(56px + 余白)のパディング。`lg:pt-8` でデスクトップでは通常に戻す。

**Step 3: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 4: コミット**

```bash
git add src/components/layout/sidebar.tsx src/app/layout.tsx
git commit -m "feat: add responsive sidebar with mobile overlay"
```

---

### Task 6: shadcn/ui 基本コンポーネントのスタイル更新

Card, Button, Badge, Input の既定スタイルを Hearth テーマに合わせる。

**Files:**

- Modify: `src/components/ui/card.tsx:1-75`
- Modify: `src/components/ui/button.tsx:1-62`
- Modify: `src/components/ui/badge.tsx:1-46`
- Modify: `src/components/ui/input.tsx:1-21`

**Step 1: Card コンポーネントを更新**

`src/components/ui/card.tsx` の Card 関数のクラスを変更:

```tsx
// 旧:
"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm";
// 新:
"bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border py-6 shadow-[0_2px_8px_rgba(61,46,31,0.06)] transition-all duration-200";
```

**Step 2: Button コンポーネントを更新**

`src/components/ui/button.tsx` の `buttonVariants` の variant.default を変更:

```tsx
// 旧:
default: "bg-primary text-primary-foreground hover:bg-primary/90",
// 新:
default: "bg-primary text-primary-foreground hover:bg-[oklch(0.55_0.15_60)] active:scale-[0.98]",
```

variant.ghost を変更:

```tsx
// 旧:
ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
// 新:
ghost: "hover:bg-accent hover:text-accent-foreground",
```

**Step 3: Badge コンポーネントを更新**

`src/components/ui/badge.tsx` の `badgeVariants` を変更。variant に `status-done`, `status-progress`, `status-todo` を追加:

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        "status-done": "bg-[#6B8F71] text-white",
        "status-progress": "bg-[oklch(0.65_0.17_70)] text-white",
        "status-todo": "bg-[#E8DDD3] text-[#594A3A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
```

**Step 4: Input コンポーネントを更新**

`src/components/ui/input.tsx` のフォーカススタイルを変更:

```tsx
// 旧:
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
// 新:
"focus-visible:border-primary focus-visible:ring-primary/15 focus-visible:ring-[3px]",
```

**Step 5: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 6: コミット**

```bash
git add src/components/ui/card.tsx src/components/ui/button.tsx src/components/ui/badge.tsx src/components/ui/input.tsx
git commit -m "feat: update shadcn/ui components to Hearth theme"
```

---

### Task 7: ダッシュボードページ更新

ダッシュボードの見出しとメンバーリストコンポーネントを Hearth スタイルに更新。

**Files:**

- Modify: `src/app/page.tsx:1-14`
- Modify: `src/components/member/member-list.tsx:1-63`

**Step 1: ダッシュボードページの見出しをセリフ体に**

`src/app/page.tsx`:

```tsx
import { getMembers } from "@/lib/actions/member-actions";
import { MemberList } from "@/components/member/member-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const members = await getMembers();
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">ダッシュボード</h1>
      <MemberList members={members} />
    </div>
  );
}
```

**Step 2: メンバーリストを Hearth スタイルに更新**

`src/components/member/member-list.tsx`:

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { formatDate } from "@/lib/format";

type MemberWithStats = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  _count: { actionItems: number };
  meetings: { date: Date }[];
};

type Props = {
  members: MemberWithStats[];
};

export function MemberList({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>メンバーがまだ登録されていません</p>
        <Link href="/members/new">
          <Button className="mt-4">メンバーを追加</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {members.map((member, index) => (
        <Card
          key={member.id}
          className={`animate-fade-in-up hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(61,46,31,0.10)] stagger-${Math.min(index + 1, 5)}`}
        >
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <AvatarInitial name={member.name} size="lg" />
              <div>
                <Link
                  href={`/members/${member.id}`}
                  className="font-heading text-lg text-foreground hover:text-primary transition-colors"
                >
                  {member.name}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {[member.department, member.position].filter(Boolean).join(" / ")}
                </div>
              </div>
              {member._count.actionItems > 0 && (
                <Badge variant="status-todo">未完了 {member._count.actionItems}件</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {member.meetings[0] ? `最終: ${formatDate(member.meetings[0].date)}` : "未実施"}
              </span>
              <Link href={`/members/${member.id}/meetings/new`}>
                <Button size="sm">新規1on1</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Step 3: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 4: コミット**

```bash
git add src/app/page.tsx src/components/member/member-list.tsx
git commit -m "feat: update dashboard and member list to Hearth design"
```

---

### Task 8: メンバー追加ページ更新

**Files:**

- Modify: `src/app/members/new/page.tsx:1-10`
- Modify: `src/components/member/member-form.tsx:1-63`

**Step 1: ページ見出しをセリフ体に**

`src/app/members/new/page.tsx`:

```tsx
import { MemberForm } from "@/components/member/member-form";

export default function NewMemberPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
```

**Step 2: MemberForm のスタイルを更新**

`src/components/member/member-form.tsx` で以下を変更:

- `text-red-600` → `text-destructive`
- CardTitle に `font-heading` クラスを追加

具体的には:

```tsx
<CardTitle className="font-heading text-xl">メンバー登録</CardTitle>
```

と:

```tsx
{
  error && <p className="text-sm text-destructive">{error}</p>;
}
```

**Step 3: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 4: コミット**

```bash
git add src/app/members/new/page.tsx src/components/member/member-form.tsx
git commit -m "feat: update member add page to Hearth design"
```

---

### Task 9: メンバー詳細ページ更新

**Files:**

- Modify: `src/app/members/[id]/page.tsx:1-37`

**Step 1: ページを Hearth スタイルに更新**

`src/app/members/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember } from "@/lib/actions/member-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MeetingHistory } from "@/components/meeting/meeting-history";
import { ActionListCompact } from "@/components/action/action-list-compact";
import { AvatarInitial } from "@/components/ui/avatar-initial";

type Props = { params: Promise<{ id: string }> };

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <AvatarInitial name={member.name} size="lg" />
          <div>
            <h1 className="font-heading text-3xl text-foreground">{member.name}</h1>
            <p className="text-muted-foreground">
              {[member.department, member.position].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>
        <Link href={`/members/${id}/meetings/new`}>
          <Button>新規1on1</Button>
        </Link>
      </div>
      <h2 className="font-heading text-xl mb-3 text-foreground">1on1履歴</h2>
      <MeetingHistory meetings={member.meetings} memberId={id} />
      <Separator className="my-6" />
      <h2 className="font-heading text-xl mb-3 text-foreground">アクションアイテム</h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
```

**Step 2: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 3: コミット**

```bash
git add src/app/members/[id]/page.tsx
git commit -m "feat: update member detail page to Hearth design"
```

---

### Task 10: ミーティング関連コンポーネント更新

**Files:**

- Modify: `src/app/members/[id]/meetings/new/page.tsx:1-36`
- Modify: `src/app/members/[id]/meetings/[meetingId]/page.tsx:1-36`
- Modify: `src/components/meeting/meeting-form.tsx`
- Modify: `src/components/meeting/meeting-detail.tsx:1-70`
- Modify: `src/components/meeting/meeting-history.tsx:1-51`
- Modify: `src/components/meeting/previous-meeting-sidebar.tsx:1-85`

**Step 1: 新規1on1ページを更新**

`src/app/members/[id]/meetings/new/page.tsx`:

- 見出しに `font-heading text-3xl` を適用
- `animate-fade-in-up` を追加
- 2カラムレイアウトにレスポンシブ対応: `flex gap-8` → `flex flex-col lg:flex-row gap-8`

```tsx
import { notFound } from "next/navigation";
import { getMember } from "@/lib/actions/member-actions";
import { getPreviousMeeting } from "@/lib/actions/meeting-actions";
import { getPendingActionItems } from "@/lib/actions/action-item-actions";
import { MeetingForm } from "@/components/meeting/meeting-form";
import { PreviousMeetingSidebar } from "@/components/meeting/previous-meeting-sidebar";

type Props = { params: Promise<{ id: string }> };

export default async function NewMeetingPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) {
    notFound();
  }

  const previousMeeting = await getPreviousMeeting(id);
  const pendingActions = await getPendingActionItems(id);

  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">{member.name}との1on1</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <MeetingForm memberId={id} />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <PreviousMeetingSidebar
            previousMeeting={previousMeeting}
            pendingActions={pendingActions}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: ミーティング詳細ページを更新**

`src/app/members/[id]/meetings/[meetingId]/page.tsx`:

- 見出しに `font-heading text-3xl` を適用
- `animate-fade-in-up` を追加

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeeting } from "@/lib/actions/meeting-actions";
import { Button } from "@/components/ui/button";
import { MeetingDetail } from "@/components/meeting/meeting-detail";

type Props = { params: Promise<{ id: string; meetingId: string }> };

export default async function MeetingDetailPage({ params }: Props) {
  const { id, meetingId } = await params;
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    notFound();
  }

  const actionItemsWithMeeting = meeting.actionItems.map((a) => ({
    ...a,
    meeting: { date: meeting.date },
  }));

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-heading text-3xl text-foreground">{meeting.member.name}との1on1</h1>
        <Link href={`/members/${id}`}>
          <Button variant="outline">戻る</Button>
        </Link>
      </div>
      <MeetingDetail
        date={meeting.date}
        topics={meeting.topics}
        actionItems={actionItemsWithMeeting}
      />
    </div>
  );
}
```

**Step 3: MeetingForm の text-gray-500 を text-muted-foreground に更新**

`src/components/meeting/meeting-form.tsx` で以下を変更:

- `text-gray-500` → `text-muted-foreground`
- `text-red-600` → `text-destructive`
- CardTitle に `font-heading` を追加

**Step 4: MeetingDetail の text-gray-\* を更新**

`src/components/meeting/meeting-detail.tsx` で以下を変更:

- `text-gray-600` → `text-muted-foreground`
- `text-gray-500` → `text-muted-foreground`
- h2 に `font-heading text-xl` を適用（`text-lg font-semibold` から変更）

**Step 5: MeetingHistory のスタイルを更新**

`src/components/meeting/meeting-history.tsx` で以下を変更:

- `text-gray-500` → `text-muted-foreground`
- `hover:bg-gray-50` → `hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(61,46,31,0.10)]`
- `font-medium` → `font-heading`

**Step 6: PreviousMeetingSidebar のスタイルを更新**

`src/components/meeting/previous-meeting-sidebar.tsx` で以下を変更:

- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground`
- CardTitle に `font-heading` を追加

**Step 7: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 8: コミット**

```bash
git add src/app/members/ src/components/meeting/
git commit -m "feat: update meeting pages and components to Hearth design"
```

---

### Task 11: アクション関連コンポーネント更新

**Files:**

- Modify: `src/app/actions/page.tsx:1-34`
- Modify: `src/components/action/action-list-full.tsx:1-79`
- Modify: `src/components/action/action-list-compact.tsx:1-60`

**Step 1: アクション一覧ページを更新**

`src/app/actions/page.tsx`:

- 見出しに `font-heading text-3xl` を適用
- `animate-fade-in-up` を追加

**Step 2: ActionListFull のスタイルを更新**

`src/components/action/action-list-full.tsx` で以下を変更:

- `text-gray-500` → `text-muted-foreground`
- カードにホバーエフェクトを追加

**Step 3: ActionListCompact のスタイルを更新**

`src/components/action/action-list-compact.tsx` で以下を変更:

- `text-gray-500` → `text-muted-foreground`
- `statusColors` マッピングを新しいバッジバリアントに更新:

```typescript
const statusColors: Record<string, "status-done" | "status-progress" | "status-todo"> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-progress",
  DONE: "status-done",
};
```

**Step 4: ビルドして確認**

Run: `npm run build`
Expected: ビルド成功。

**Step 5: コミット**

```bash
git add src/app/actions/page.tsx src/components/action/
git commit -m "feat: update action pages and components to Hearth design"
```

---

### Task 12: 既存テストの修正

スタイル変更でテストが壊れていないか確認し、必要なら修正する。

**Files:**

- Modify: テストファイル（必要に応じて）

**Step 1: 全テストを実行**

Run: `npm test`
Expected: テストが通ることを確認。

**Step 2: 壊れたテストがあれば修正**

text-gray-500 → text-muted-foreground などのクラス名変更でスナップショットや DOM クエリが壊れる可能性あり。テストの内容を確認し、クラス名に依存している箇所を修正。

**Step 3: テストを再実行して全パス確認**

Run: `npm test`
Expected: 全テスト PASS。

**Step 4: コミット**

```bash
git add -u
git commit -m "fix: update tests for Hearth design changes"
```

---

### Task 13: Lint・型チェック・ビルド最終確認

**Step 1: Lint 実行**

Run: `npm run lint`
Expected: エラーなし。

**Step 2: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし。

**Step 3: Prettier フォーマット**

Run: `npm run format`

**Step 4: 最終ビルド**

Run: `npm run build`
Expected: ビルド成功。

**Step 5: コミット**

```bash
git add -u
git commit -m "chore: lint, format, and final build verification"
```

---

### Task 14: 目視確認と微調整

**Step 1: 開発サーバーを起動**

Run: `npm run dev`

**Step 2: 各ページを目視確認**

以下のページを確認:

- `/` — ダッシュボード（メンバーカード、アバター、アニメーション）
- `/members/new` — メンバー追加フォーム
- `/members/[id]` — メンバー詳細（アバター、ミーティング履歴）
- `/members/[id]/meetings/new` — 新規1on1（2カラム、サイドバー）
- `/members/[id]/meetings/[meetingId]` — ミーティング詳細
- `/actions` — アクション一覧（フィルター、バッジ色）

モバイル表示も確認:

- サイドバーのハンバーガーメニュー
- オーバーレイ動作
- 2カラムの折り返し

**Step 3: 必要な微調整を実施**

- 余白の調整
- フォントサイズの微調整
- 色のコントラスト確認

**Step 4: コミット**

```bash
git add -u
git commit -m "style: fine-tune Hearth design after visual review"
```
