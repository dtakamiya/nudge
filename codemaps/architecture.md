# Architecture Overview

<!-- freshness: 2026-02-25 -->

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: Prisma ORM + SQLite (local-first)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Validation**: Zod 4
- **Testing**: Vitest + Testing Library + Playwright E2E
- **DnD**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: recharts
- **Toast**: sonner
- **Themes**: next-themes (dark mode)

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
│   ├── tasks/            # Tasks page
│   ├── analytics/        # Analytics dashboard
│   └── settings/
│       └── templates/    # Custom meeting template management
├── components/
│   ├── layout/           # Sidebar, breadcrumb, search, theme toggle
│   ├── dashboard/        # KPI cards, activity feed, health score
│   ├── member/           # Member cards, forms, timeline, checkin summary
│   ├── meeting/          # Meeting form (DnD), recording mode, coaching
│   ├── action/           # Action item list, pagination, due-date badge
│   ├── analytics/        # Charts, heatmap, checkin trend
│   ├── tag/              # Tag input, badge, filter
│   └── ui/               # shadcn/ui + custom (avatar, empty-state, skeleton)
├── hooks/                # Custom React hooks (6+)
├── lib/
│   ├── actions/          # Server Actions (all writes)
│   ├── validations/      # Zod schemas
│   ├── prisma.ts         # DB singleton
│   ├── format.ts         # Date formatting
│   ├── avatar.ts         # Initials & gradient
│   ├── schedule.ts       # Overdue / next-date calc
│   ├── constants.ts      # App-wide constants
│   ├── coaching-tips.ts  # Coaching assist hint definitions
│   ├── icebreakers.ts    # Icebreaker question list
│   ├── checkin-messages.ts # Check-in response messages
│   ├── condition-diff.ts # Check-in condition diff logic
│   ├── due-date.ts       # Due date calculation utilities
│   ├── group-actions.ts  # Action item grouping logic
│   ├── group-tasks.ts    # Task grouping logic
│   ├── meeting-summary.ts # Meeting summary generation
│   ├── meeting-templates.ts # Built-in templates
│   ├── mood.ts           # Mood score conversion
│   ├── export.ts         # Meeting data export
│   ├── ical.ts           # iCal export
│   ├── toast-messages.ts # Toast notification messages
│   └── dnd-accessibility.ts # DnD accessibility config
└── generated/prisma/     # Auto-generated (gitignored)

prisma/
├── schema.prisma         # DB schema (8 models)
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

| Route                                | Page                                             | Purpose                    |
| ------------------------------------ | ------------------------------------------------ | -------------------------- |
| `/`                                  | `app/page.tsx`                                   | Dashboard                  |
| `/members`                           | `app/members/page.tsx`                           | Member list                |
| `/members/new`                       | `app/members/new/page.tsx`                       | Create member              |
| `/members/[id]`                      | `app/members/[id]/page.tsx`                      | Member detail              |
| `/members/[id]/meetings/new`         | `app/members/[id]/meetings/new/page.tsx`         | Create meeting             |
| `/members/[id]/meetings/prepare`     | `app/members/[id]/meetings/prepare/page.tsx`     | Meeting prep               |
| `/members/[id]/meetings/[meetingId]` | `app/members/[id]/meetings/[meetingId]/page.tsx` | Meeting detail / recording |
| `/actions`                           | `app/actions/page.tsx`                           | All action items           |
| `/tasks`                             | `app/tasks/page.tsx`                             | Tasks page                 |
| `/analytics`                         | `app/analytics/page.tsx`                         | Analytics                  |
| `/settings/templates`                | `app/settings/templates/page.tsx`                | Template management        |
