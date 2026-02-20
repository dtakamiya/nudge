# 1on1 Log & Action Tracker - Design Document

## Overview

A personal app for managing 1-on-1 meeting records, topics, and action items with team members. Automatically carries over previous topics and visualizes action progress to improve 1-on-1 quality.

## Constraints

- **User:** Single user (manager), no authentication needed
- **Scale:** 5-15 members
- **Deploy:** Local only
- **Stack:** Next.js 15 (App Router) + Prisma + SQLite + Tailwind CSS + shadcn/ui

## Data Model

### Member

| Field      | Type     | Notes          |
| ---------- | -------- | -------------- |
| id         | UUID     | Primary key    |
| name       | string   | Required       |
| department | string   | Optional       |
| position   | string   | Optional       |
| createdAt  | datetime | Auto-generated |
| updatedAt  | datetime | Auto-generated |

### Meeting

| Field     | Type     | Notes                |
| --------- | -------- | -------------------- |
| id        | UUID     | Primary key          |
| memberId  | UUID     | FK -> Member         |
| date      | datetime | When the 1on1 occurs |
| createdAt | datetime | Auto-generated       |
| updatedAt | datetime | Auto-generated       |

### Topic

| Field     | Type     | Notes                                          |
| --------- | -------- | ---------------------------------------------- |
| id        | UUID     | Primary key                                    |
| meetingId | UUID     | FK -> Meeting                                  |
| category  | enum     | WORK_PROGRESS, CAREER, ISSUES, FEEDBACK, OTHER |
| title     | string   | Required                                       |
| notes     | string   | Detailed notes                                 |
| sortOrder | int      | Display order within a meeting                 |
| createdAt | datetime | Auto-generated                                 |
| updatedAt | datetime | Auto-generated                                 |

### ActionItem

| Field       | Type     | Notes                         |
| ----------- | -------- | ----------------------------- |
| id          | UUID     | Primary key                   |
| meetingId   | UUID     | FK -> Meeting (where created) |
| memberId    | UUID     | FK -> Member                  |
| title       | string   | Required                      |
| description | string   | Optional details              |
| status      | enum     | TODO, IN_PROGRESS, DONE       |
| dueDate     | date     | Optional                      |
| completedAt | datetime | Set when status becomes DONE  |
| createdAt   | datetime | Auto-generated                |
| updatedAt   | datetime | Auto-generated                |

## Screen Structure

```
/                                      Dashboard (member list + pending action counts)
/members/new                           New member form
/members/[id]                          Member detail (meeting history + actions)
/members/[id]/meetings/new             New 1on1 (with previous log sidebar)
/members/[id]/meetings/[meetingId]     1on1 detail / edit
/actions                               Cross-member action list with filters
```

### Dashboard (/)

- Member list with name, department, last meeting date, pending action count
- Quick "New 1on1" button per member

### Member Detail (/members/[id])

- Member info header
- Meeting history (chronological, most recent first)
- Action items for this member with status filter

### New 1on1 (/members/[id]/meetings/new)

- **Left panel:** Structured input form
  - Date picker
  - Topic sections (category + title + notes), add/remove dynamically
  - Action items (title + description + due date), add/remove dynamically
- **Right sidebar:**
  - Previous meeting log (read-only)
  - Pending action items with checkbox to mark complete

### Action List (/actions)

- Full list of all action items across members
- Filter by: status (TODO / IN_PROGRESS / DONE), member
- Sort by: due date, created date
- One-click status change

## Key Features

### Previous Log Carryover

- On new 1on1 creation, auto-fetch the most recent Meeting for the same member
- Display previous topics and notes in a read-only sidebar
- Show pending ActionItems with ability to update status inline

### Action Tracking

- Actions created within 1on1 form, linked to both Meeting and Member
- Cross-member action list at /actions for holistic view
- Status transitions: TODO -> IN_PROGRESS -> DONE (one-click)

## Technical Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Framework  | Next.js 15 (App Router)  |
| ORM        | Prisma                   |
| Database   | SQLite                   |
| UI         | Tailwind CSS + shadcn/ui |
| Validation | Zod                      |
| Testing    | Vitest + Testing Library |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── actions/
│   │   └── page.tsx
│   └── members/
│       ├── new/page.tsx
│       └── [id]/
│           ├── page.tsx
│           └── meetings/
│               ├── new/page.tsx
│               └── [meetingId]/page.tsx
├── components/
│   ├── ui/                          # shadcn/ui
│   ├── member/
│   ├── meeting/
│   └── action/
├── lib/
│   ├── prisma.ts
│   ├── actions/                     # Server Actions
│   │   ├── member-actions.ts
│   │   ├── meeting-actions.ts
│   │   └── action-item-actions.ts
│   └── validations/                 # Zod schemas
│       ├── member.ts
│       ├── meeting.ts
│       └── action-item.ts
prisma/
├── schema.prisma
└── dev.db
```

## Design Decisions

1. **Server Actions over API Routes** - Simpler for single-user local app. No need for REST endpoints.
2. **SQLite over PostgreSQL** - Local-only deployment. Single file DB. Zero config.
3. **Structured topics over freeform** - Categories enforce consistency and enable future filtering/analytics.
4. **shadcn/ui** - Copy-paste components, fully customizable, no vendor lock-in.
5. **No authentication** - Single user, local only. YAGNI.
6. **No dark mode** - Keep scope minimal for v1.
