# Frontend Structure

<!-- freshness: 2026-02-23 -->

## Component Map

### Layout (`src/components/layout/`)

| File                             | Type   | Purpose                                          |
| -------------------------------- | ------ | ------------------------------------------------ |
| `sidebar.tsx`                    | Client | Fixed desktop sidebar + mobile hamburger overlay |
| `breadcrumb.tsx`                 | Server | Route breadcrumb trail                           |
| `global-search.tsx`              | Client | Cmd+K search overlay                             |
| `keyboard-shortcut-provider.tsx` | Client | Shortcut context provider                        |
| `shortcut-help-dialog.tsx`       | Client | `?` key → help dialog                            |
| `theme-toggle.tsx`               | Client | Dark/light mode toggle                           |

**Sidebar data**: fetched inline in `layout.tsx` via `prisma.member.findMany()` + `prisma.actionItem.count()`

### Dashboard (`src/components/dashboard/`)

| Component                          | Data Source                                 |
| ---------------------------------- | ------------------------------------------- |
| `dashboard-summary.tsx`            | `getDashboardSummary()` → 4 KPI cards       |
| `upcoming-actions-section.tsx`     | `getUpcomingActions()`                      |
| `recommended-meetings-section.tsx` | `getRecommendedMeetings()`                  |
| `scheduled-meetings-section.tsx`   | `getScheduledMeetingsThisWeek()`            |
| `recent-activity-feed.tsx`         | `getRecentActivity()`                       |
| `reminder-alert-banner.tsx`        | `getOverdueReminders()`                     |
| `browser-notification.tsx`         | `getOverdueReminders()` → push notification |
| `onboarding-card.tsx`              | Static (first-use guide)                    |

### Member (`src/components/member/`)

| Component                  | Type   | Purpose                               |
| -------------------------- | ------ | ------------------------------------- |
| `member-list.tsx`          | Server | Grid of member cards                  |
| `member-form.tsx`          | Client | Create / edit form                    |
| `member-stats-bar.tsx`     | Server | Meetings + actions + interval metrics |
| `member-quick-actions.tsx` | Client | Pending actions quick list            |
| `member-edit-dialog.tsx`   | Client | Modal wrapping `member-form`          |
| `member-delete-dialog.tsx` | Client | AlertDialog → `deleteMember()`        |
| `mood-trend-chart.tsx`     | Client | recharts LineChart of meeting moods   |

### Meeting (`src/components/meeting/`)

| Component                        | Type   | Purpose                               |
| -------------------------------- | ------ | ------------------------------------- |
| `meeting-form.tsx`               | Client | Full create/edit form with DnD        |
| `sortable-topic-item.tsx`        | Client | `@dnd-kit` draggable topic row        |
| `sortable-action-item.tsx`       | Client | `@dnd-kit` draggable action row       |
| `meeting-detail.tsx`             | Server | Read-only meeting view                |
| `meeting-detail-page-client.tsx` | Client | Client wrapper (edit/delete handlers) |
| `meeting-history.tsx`            | Client | Paginated past meetings list          |
| `past-meetings-accordion.tsx`    | Client | Collapsible past meeting summaries    |
| `new-meeting-dialog.tsx`         | Client | Quick meeting creation modal          |
| `meeting-delete-dialog.tsx`      | Client | AlertDialog → `deleteMeeting()`       |
| `meeting-prepare.tsx`            | Client | Preparation checklist view            |
| `prepare-action-checklist.tsx`   | Client | Pending actions checkbox list         |
| `previous-meeting-sidebar.tsx`   | Server | Reference panel (read-only)           |
| `template-selector.tsx`          | Client | Meeting topic template picker         |
| `mood-selector.tsx`              | Client | 1–5 emoji mood scale                  |
| `export-dialog.tsx`              | Client | CSV export dialog                     |

**Meeting Form Tree**

```
meeting-form.tsx (Client, DnD state)
├── mood-selector.tsx
├── DndContext (topics)
│   └── sortable-topic-item.tsx × N
│       └── tag-input.tsx
├── DndContext (action items)
│   └── sortable-action-item.tsx × N
│       └── tag-input.tsx
└── Submit → createMeeting() / updateMeeting()
```

### Action (`src/components/action/`)

| Component                 | Purpose                              |
| ------------------------- | ------------------------------------ |
| `action-list-full.tsx`    | Full list with member info + filters |
| `action-list-compact.tsx` | Compact list for member detail       |
| `action-filters.tsx`      | Status / member / tag filter UI      |

### Analytics (`src/components/analytics/`)

| Component                           | Chart Type                     |
| ----------------------------------- | ------------------------------ |
| `meeting-frequency-chart.tsx`       | recharts Bar (12-month)        |
| `meeting-heatmap.tsx`               | recharts Heatmap (day-of-week) |
| `meeting-interval-table.tsx`        | Native table                   |
| `topic-distribution-chart.tsx`      | recharts Pie                   |
| `topic-trend-chart.tsx`             | recharts Area                  |
| `action-kpi-cards.tsx`              | 3 metric cards                 |
| `action-completion-trend-chart.tsx` | recharts Bar (monthly)         |

### Tag (`src/components/tag/`)

| Component        | Purpose                        |
| ---------------- | ------------------------------ |
| `tag-input.tsx`  | Autocomplete + inline create   |
| `tag-badge.tsx`  | Colored chip (optional remove) |
| `tag-filter.tsx` | Multi-select filter            |

### UI (`src/components/ui/`)

shadcn/ui base: `button`, `input`, `label`, `textarea`, `select`, `dialog`, `alert-dialog`, `accordion`, `badge`, `card`, `separator`, `table`, `sonner`

Custom: `avatar-initial.tsx` (initials + gradient), `empty-state.tsx` (icon + message)

## Server vs Client Component Split

- **Server** (default): data fetching, no interactivity, no browser APIs
- **Client** (`"use client"`): forms, state, DnD, charts, event handlers, toasts

## Design System

- **Theme**: OKLch color palette in `globals.css`; `--primary` indigo `oklch(0.55 0.2 270)`
- **Fonts**: Geist Sans + Noto Sans JP
- **Animations**: `animate-fade-in-up`, `animate-slide-in`, `animate-badge-bounce`, `stagger-1..5`
- **Responsive**: mobile-first Tailwind (`sm:`, `lg:` breakpoints), hamburger menu on mobile

## Form Submission Pattern

```typescript
"use client";
const handleSubmit = async (input) => {
  const result = await serverAction(input);
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  toast.success("成功");
  router.push(nextRoute);
};
```

## DnD Reorder Pattern

```typescript
const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
    {items.map(item => <SortableItem key={item.id} {...item} />)}
  </SortableContext>
</DndContext>

function handleDragEnd({ active, over }) {
  if (over && active.id !== over.id)
    setItems(prev => arrayMove(prev, oldIdx, newIdx));
}
```
