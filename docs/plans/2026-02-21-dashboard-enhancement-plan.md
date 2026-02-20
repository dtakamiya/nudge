# ダッシュボード強化 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ダッシュボードに KPI サマリーカードを追加し、メンバーリストに 1on1 状態情報を追加して、全体状況を一目で把握できるようにする。

**Architecture:** 新規 Server Action `getDashboardSummary()` で集計データを取得し、既存の `getMembers()` を拡張して期限超過アクション数を追加。新規 `DashboardSummary` コンポーネントでサマリーカードを表示し、既存 `MemberList` に経過日数・期限超過情報を追加する。

**Tech Stack:** Next.js 16 (Server Actions), Prisma + SQLite, Tailwind CSS 4, shadcn/ui Card/Badge, lucide-react icons, Vitest

**Design doc:** `docs/plans/2026-02-21-dashboard-enhancement-design.md`

---

### Task 1: `formatRelativeDate` ユーティリティ

**Files:**

- Modify: `src/lib/format.ts`
- Test: `src/lib/__tests__/format.test.ts` (新規)

**Step 1: Write the failing test**

`src/lib/__tests__/format.test.ts` を作成:

```typescript
import { describe, it, expect } from "vitest";
import { formatRelativeDate } from "@/lib/format";

describe("formatRelativeDate", () => {
  it("returns '未実施' for null", () => {
    expect(formatRelativeDate(null)).toBe("未実施");
  });

  it("returns '今日' for today", () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe("今日");
  });

  it("returns '1日前' for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe("1日前");
  });

  it("returns '7日前' for 7 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    expect(formatRelativeDate(date)).toBe("7日前");
  });

  it("returns '2週間前' for 14 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    expect(formatRelativeDate(date)).toBe("2週間前");
  });

  it("returns '3週間前' for 21 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 21);
    expect(formatRelativeDate(date)).toBe("3週間前");
  });

  it("returns '1ヶ月以上前' for 35 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 35);
    expect(formatRelativeDate(date)).toBe("1ヶ月以上前");
  });

  it("accepts string dates", () => {
    const today = new Date().toISOString();
    expect(formatRelativeDate(today)).toBe("今日");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/format.test.ts`
Expected: FAIL with "formatRelativeDate is not a function" or similar import error

**Step 3: Write minimal implementation**

`src/lib/format.ts` に `formatRelativeDate` を追加:

```typescript
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "未実施";
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "今日";
  if (diffDays < 14) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return "1ヶ月以上前";
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/format.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/__tests__/format.test.ts
git commit -m "feat: add formatRelativeDate utility for dashboard"
```

---

### Task 2: `getDashboardSummary` Server Action

**Files:**

- Create: `src/lib/actions/dashboard-actions.ts`
- Test: `src/lib/actions/__tests__/dashboard-actions.test.ts` (新規)

**Step 1: Write the failing test**

`src/lib/actions/__tests__/dashboard-actions.test.ts` を作成:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getDashboardSummary } from "../dashboard-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";
import { updateActionItemStatus } from "../action-item-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("getDashboardSummary", () => {
  it("returns zeros when no data exists", async () => {
    const summary = await getDashboardSummary();
    expect(summary).toEqual({
      needsFollowUp: 0,
      actionCompletionRate: 0,
      totalActions: 0,
      completedActions: 0,
      meetingsThisMonth: 0,
      overdueActions: 0,
    });
  });

  it("counts members needing follow-up (no meeting in 14+ days)", async () => {
    const member1 = await createMember({ name: "Recent" });
    const member2 = await createMember({ name: "Old" });
    const member3 = await createMember({ name: "Never" });

    // member1: meeting today
    await createMeeting({
      memberId: member1.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // member2: meeting 15 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);
    await createMeeting({
      memberId: member2.id,
      date: oldDate.toISOString(),
      topics: [],
      actionItems: [],
    });

    // member3: no meeting at all

    const summary = await getDashboardSummary();
    expect(summary.needsFollowUp).toBe(2); // member2 + member3
  });

  it("calculates action completion rate", async () => {
    const member = await createMember({ name: "Test" });
    await createMeeting({
      memberId: member.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Done Task", description: "" },
        { title: "Todo Task", description: "" },
        { title: "Progress Task", description: "" },
        { title: "Done Task 2", description: "" },
      ],
    });
    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");
    await updateActionItemStatus(items[3].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.totalActions).toBe(4);
    expect(summary.completedActions).toBe(2);
    expect(summary.actionCompletionRate).toBe(50);
  });

  it("counts meetings this month", async () => {
    const member = await createMember({ name: "Test" });

    // This month
    await createMeeting({
      memberId: member.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [],
    });

    // Last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    await createMeeting({
      memberId: member.id,
      date: lastMonth.toISOString(),
      topics: [],
      actionItems: [],
    });

    const summary = await getDashboardSummary();
    expect(summary.meetingsThisMonth).toBe(1);
  });

  it("counts overdue actions", async () => {
    const member = await createMember({ name: "Test" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await createMeeting({
      memberId: member.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue", description: "", dueDate: yesterday.toISOString() },
        { title: "Not yet", description: "", dueDate: tomorrow.toISOString() },
        { title: "No due", description: "" },
      ],
    });

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(1);
  });

  it("does not count completed items as overdue", async () => {
    const member = await createMember({ name: "Test" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await createMeeting({
      memberId: member.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Overdue but done", description: "", dueDate: yesterday.toISOString() },
      ],
    });

    const items = await prisma.actionItem.findMany();
    await updateActionItemStatus(items[0].id, "DONE");

    const summary = await getDashboardSummary();
    expect(summary.overdueActions).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/actions/__tests__/dashboard-actions.test.ts`
Expected: FAIL with "Cannot find module '../dashboard-actions'"

**Step 3: Write minimal implementation**

`src/lib/actions/dashboard-actions.ts` を作成:

```typescript
"use server";

import { prisma } from "@/lib/prisma";

export type DashboardSummary = {
  needsFollowUp: number;
  actionCompletionRate: number;
  totalActions: number;
  completedActions: number;
  meetingsThisMonth: number;
  overdueActions: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [members, actionCounts, meetingsThisMonth, overdueActions] = await Promise.all([
    prisma.member.findMany({
      include: {
        meetings: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
      },
    }),
    prisma.actionItem.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.meeting.count({
      where: { date: { gte: firstOfMonth } },
    }),
    prisma.actionItem.count({
      where: {
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
    }),
  ]);

  const needsFollowUp = members.filter((m) => {
    const lastMeeting = m.meetings[0];
    if (!lastMeeting) return true;
    return new Date(lastMeeting.date) < fourteenDaysAgo;
  }).length;

  const totalActions = actionCounts.reduce((sum, g) => sum + g._count.id, 0);
  const completedActions = actionCounts.find((g) => g.status === "DONE")?._count.id ?? 0;
  const actionCompletionRate =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return {
    needsFollowUp,
    actionCompletionRate,
    totalActions,
    completedActions,
    meetingsThisMonth,
    overdueActions,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/actions/__tests__/dashboard-actions.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/actions/dashboard-actions.ts src/lib/actions/__tests__/dashboard-actions.test.ts
git commit -m "feat: add getDashboardSummary server action with tests"
```

---

### Task 3: `getMembers` 拡張（期限超過アクション数追加）

**Files:**

- Modify: `src/lib/actions/member-actions.ts:8-16`
- Modify: `src/lib/actions/__tests__/member-actions.test.ts`

**Step 1: Write the failing test**

`src/lib/actions/__tests__/member-actions.test.ts` の `getMembers` describe ブロックにテストを追加:

```typescript
it("includes overdue action count per member", async () => {
  const member = await createMember({ name: "Test" });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await createMeeting({
    memberId: member.id,
    date: new Date().toISOString(),
    topics: [],
    actionItems: [
      { title: "Overdue", description: "", dueDate: yesterday.toISOString() },
      { title: "Not yet", description: "", dueDate: tomorrow.toISOString() },
      { title: "No due", description: "" },
    ],
  });

  const members = await getMembers();
  expect(members[0]._count.actionItems).toBe(3); // all pending
  expect(members[0].overdueActionCount).toBe(1);
});
```

**注意:** このテストでは `createMeeting` のインポートが必要。ファイル先頭に以下を追加:

```typescript
import { createMeeting } from "../meeting-actions";
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/actions/__tests__/member-actions.test.ts`
Expected: FAIL with "Property 'overdueActionCount' does not exist"

**Step 3: Modify `getMembers` implementation**

`src/lib/actions/member-actions.ts` の `getMembers()` を修正:

```typescript
export async function getMembers() {
  const now = new Date();
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { actionItems: { where: { status: { not: "DONE" } } } } },
      meetings: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
      actionItems: {
        where: {
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
        select: { id: true },
      },
    },
  });

  return members.map((member) => ({
    ...member,
    overdueActionCount: member.actionItems.length,
    actionItems: undefined,
  }));
}
```

**重要:** `actionItems` フィールドを `undefined` にして返却から除外し、`overdueActionCount` を計算結果として追加する。

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/actions/__tests__/member-actions.test.ts`
Expected: ALL PASS

**Step 5: Run all tests to check for regressions**

Run: `npm test`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/actions/member-actions.ts src/lib/actions/__tests__/member-actions.test.ts
git commit -m "feat: add overdueActionCount to getMembers response"
```

---

### Task 4: `DashboardSummary` コンポーネント

**Files:**

- Create: `src/components/dashboard/dashboard-summary.tsx`
- Test: `src/components/dashboard/__tests__/dashboard-summary.test.tsx` (新規)

**Step 1: Write the failing test**

`src/components/dashboard/__tests__/dashboard-summary.test.tsx` を作成:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSummary } from "../dashboard-summary";
import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

const baseSummary: DashboardSummaryType = {
  needsFollowUp: 0,
  actionCompletionRate: 0,
  totalActions: 0,
  completedActions: 0,
  meetingsThisMonth: 0,
  overdueActions: 0,
};

describe("DashboardSummary", () => {
  it("renders all four summary cards", () => {
    render(<DashboardSummary summary={baseSummary} />);
    expect(screen.getByText("要フォロー")).toBeDefined();
    expect(screen.getByText("アクション完了率")).toBeDefined();
    expect(screen.getByText("今月の1on1")).toBeDefined();
    expect(screen.getByText("期限超過")).toBeDefined();
  });

  it("displays needsFollowUp count", () => {
    const summary = { ...baseSummary, needsFollowUp: 3 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("人")).toBeDefined();
  });

  it("displays action completion rate as percentage", () => {
    const summary = { ...baseSummary, actionCompletionRate: 75, totalActions: 8, completedActions: 6 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("75")).toBeDefined();
    expect(screen.getByText("%")).toBeDefined();
  });

  it("displays meetings this month count", () => {
    const summary = { ...baseSummary, meetingsThisMonth: 5 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("回")).toBeDefined();
  });

  it("displays overdue actions count", () => {
    const summary = { ...baseSummary, overdueActions: 2 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("件")).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/dashboard/__tests__/dashboard-summary.test.tsx`
Expected: FAIL with "Cannot find module '../dashboard-summary'"

**Step 3: Write the component**

`src/components/dashboard/dashboard-summary.tsx` を作成:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Calendar, Clock } from "lucide-react";
import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

type Props = {
  summary: DashboardSummaryType;
};

type SummaryCardProps = {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
};

function SummaryCard({ title, value, unit, icon, colorClass }: SummaryCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-3 p-4 pt-0">
        <div className={`rounded-xl p-2.5 ${colorClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-heading text-2xl text-foreground">
            {value}
            <span className="text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getFollowUpColor(count: number): string {
  return count > 0 ? "bg-[#C27549]/10 text-[#C27549]" : "bg-[#6B8F71]/10 text-[#6B8F71]";
}

function getCompletionColor(rate: number): string {
  if (rate >= 80) return "bg-[#6B8F71]/10 text-[#6B8F71]";
  if (rate >= 50) return "bg-[oklch(0.65_0.17_70)]/10 text-[oklch(0.65_0.17_70)]";
  return "bg-[#C27549]/10 text-[#C27549]";
}

function getOverdueColor(count: number): string {
  return count > 0 ? "bg-[#C27549]/10 text-[#C27549]" : "bg-[#6B8F71]/10 text-[#6B8F71]";
}

export function DashboardSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="要フォロー"
        value={summary.needsFollowUp}
        unit="人"
        icon={<AlertTriangle className="size-5" />}
        colorClass={getFollowUpColor(summary.needsFollowUp)}
      />
      <SummaryCard
        title="アクション完了率"
        value={summary.actionCompletionRate}
        unit="%"
        icon={<CheckCircle className="size-5" />}
        colorClass={getCompletionColor(summary.actionCompletionRate)}
      />
      <SummaryCard
        title="今月の1on1"
        value={summary.meetingsThisMonth}
        unit="回"
        icon={<Calendar className="size-5" />}
        colorClass="bg-[oklch(0.65_0.17_70)]/10 text-[oklch(0.65_0.17_70)]"
      />
      <SummaryCard
        title="期限超過"
        value={summary.overdueActions}
        unit="件"
        icon={<Clock className="size-5" />}
        colorClass={getOverdueColor(summary.overdueActions)}
      />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/dashboard/__tests__/dashboard-summary.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/components/dashboard/dashboard-summary.tsx src/components/dashboard/__tests__/dashboard-summary.test.tsx
git commit -m "feat: add DashboardSummary component with KPI cards"
```

---

### Task 5: `MemberList` コンポーネント拡張

**Files:**

- Modify: `src/components/member/member-list.tsx`

**Step 1: Update the `MemberWithStats` type**

`MemberWithStats` 型に `overdueActionCount` を追加:

```typescript
type MemberWithStats = {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  _count: { actionItems: number };
  meetings: { date: Date }[];
  overdueActionCount: number;
};
```

**Step 2: Add relative date import**

ファイル先頭のインポートに追加:

```typescript
import { formatRelativeDate } from "@/lib/format";
```

**Step 3: Update card content**

メンバーカードの右側セクションを更新。既存の `最終: {formatDate(...)}` 表示を `formatRelativeDate` ベースに変更し、経過日数に応じた色分けと期限超過表示を追加:

```tsx
<div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
    {member.overdueActionCount > 0 && (
      <Badge variant="destructive" className="bg-[#C27549]">
        期限超過 {member.overdueActionCount}件
      </Badge>
    )}
    {member._count.actionItems > 0 && (
      <Badge variant="status-todo">未完了 {member._count.actionItems}件</Badge>
    )}
  </div>
  <span className={`text-sm ${getLastMeetingColorClass(member.meetings[0]?.date ?? null)}`}>
    {formatRelativeDate(member.meetings[0]?.date ?? null)}
  </span>
  <Link href={`/members/${member.id}/meetings/new`}>
    <Button size="sm">新規1on1</Button>
  </Link>
</div>
```

カード内に色分けヘルパー関数を追加:

```typescript
function getLastMeetingColorClass(date: Date | null): string {
  if (!date) return "text-[#C27549]";
  const diffDays = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays >= 14) return "text-[#C27549]";
  if (diffDays >= 7) return "text-[oklch(0.65_0.17_70)]";
  return "text-[#6B8F71]";
}
```

**Step 4: Update sort order**

`members` をコンポーネント内で最終 1on1 が古い順にソート:

```typescript
const sortedMembers = [...members].sort((a, b) => {
  const dateA = a.meetings[0]?.date ? new Date(a.meetings[0].date).getTime() : 0;
  const dateB = b.meetings[0]?.date ? new Date(b.meetings[0].date).getTime() : 0;
  return dateA - dateB;
});
```

`members.map(...)` を `sortedMembers.map(...)` に変更。

**Step 5: Run all tests**

Run: `npm test`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/components/member/member-list.tsx
git commit -m "feat: enhance MemberList with overdue badges and relative dates"
```

---

### Task 6: ダッシュボードページ統合

**Files:**

- Modify: `src/app/page.tsx`

**Step 1: Update the dashboard page**

`src/app/page.tsx` を更新して `DashboardSummary` を統合:

```tsx
import { getMembers } from "@/lib/actions/member-actions";
import { getDashboardSummary } from "@/lib/actions/dashboard-actions";
import { MemberList } from "@/components/member/member-list";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [members, summary] = await Promise.all([getMembers(), getDashboardSummary()]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="font-heading text-3xl mb-6 text-foreground">ダッシュボード</h1>
      <DashboardSummary summary={summary} />
      <MemberList members={members} />
    </div>
  );
}
```

**Step 2: Run all tests**

Run: `npm test`
Expected: ALL PASS

**Step 3: Run build check**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate DashboardSummary into dashboard page"
```

---

### Task 7: 最終検証

**Step 1: Run full test suite**

Run: `npm test`
Expected: ALL PASS

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run format check**

Run: `npm run format:check`
Expected: All files formatted (if not, run `npm run format`)

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Manual verification**

Run: `npm run dev`
Open `http://localhost:3000` and verify:

- 4つの KPI サマリーカードが上部に表示される
- メンバーカードに経過日数と期限超過バッジが表示される
- メンバーが最終 1on1 の古い順にソートされている
- モバイル表示でカードが 2x2 グリッドになる

**Step 6: Final commit (if format changes needed)**

```bash
npm run format
git add -A
git commit -m "chore: format code"
```
