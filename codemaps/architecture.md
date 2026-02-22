# Architecture Overview

<!-- freshness: 2026-02-23 -->

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: Prisma ORM + SQLite (local-first)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Validation**: Zod 4
- **Testing**: Vitest + Testing Library + Playwright E2E
- **DnD**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: recharts

## Layered Architecture

```
Pages (App Router)            src/app/**/page.tsx
  ↓ props
React Components              src/components/*/
  ↓ call
Server Actions                src/lib/actions/*.ts
  ↓ use
Prisma ORM                    src/lib/prisma.ts
  ↓ query
SQLite Database               prisma/dev.db
```

## Key Directories

```
src/
├── app/                  # Pages & routing
│   ├── page.tsx          # Dashboard (/)
│   ├── members/          # Member CRUD + meetings
│   ├── actions/          # Action items list
│   └── analytics/        # Analytics dashboard
├── components/
│   ├── layout/           # Sidebar, breadcrumb, search
│   ├── dashboard/        # KPI cards, activity feed
│   ├── member/           # Member cards, forms
│   ├── meeting/          # Meeting form (DnD), detail
│   ├── action/           # Action item list
│   ├── analytics/        # Charts, heatmap
│   ├── tag/              # Tag input, badge, filter
│   └── ui/               # shadcn/ui + custom (avatar, empty-state)
├── lib/
│   ├── actions/          # Server Actions (all writes)
│   ├── validations/      # Zod schemas
│   ├── prisma.ts         # DB singleton
│   ├── format.ts         # Date formatting
│   ├── avatar.ts         # Initials & gradient
│   ├── schedule.ts       # Overdue / next-date calc
│   └── constants.ts      # App-wide constants
└── generated/prisma/     # Auto-generated (gitignored)

prisma/
├── schema.prisma         # DB schema (6 models)
├── seed.ts               # Seed data
└── migrations/           # Schema history
```

## Core Patterns

- **Server Actions only** – no REST API routes; all mutations via `"use server"` functions
- **ActionResult<T>** – uniform `{ success, data } | { success, error }` return type
- **runAction(fn)** – wraps every action in try/catch
- **Immutability** – components always create new objects, never mutate state in-place
- **revalidatePath** – cache invalidation after every write
- **Zod validation** – all inputs parsed at action entry before DB access

## Route Map

| Route                                | Page                                             | Purpose          |
| ------------------------------------ | ------------------------------------------------ | ---------------- |
| `/`                                  | `app/page.tsx`                                   | Dashboard        |
| `/members/new`                       | `app/members/new/page.tsx`                       | Create member    |
| `/members/[id]`                      | `app/members/[id]/page.tsx`                      | Member detail    |
| `/members/[id]/meetings/new`         | `app/members/[id]/meetings/new/page.tsx`         | Create meeting   |
| `/members/[id]/meetings/prepare`     | `app/members/[id]/meetings/prepare/page.tsx`     | Meeting prep     |
| `/members/[id]/meetings/[meetingId]` | `app/members/[id]/meetings/[meetingId]/page.tsx` | Meeting detail   |
| `/actions`                           | `app/actions/page.tsx`                           | All action items |
| `/analytics`                         | `app/analytics/page.tsx`                         | Analytics        |
