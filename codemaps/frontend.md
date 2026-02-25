# Frontend Structure

<!-- freshness: 2026-02-25 -->

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
| `flash-toast.tsx`                  | URL param → auto-toast on load              |
| `dashboard-skeleton.tsx`           | Loading skeleton UI                         |
| `onboarding-card.tsx`              | Static (first-use guide)                    |

### Member (`src/components/member/`)

| Component                     | Type   | Purpose                               |
| ----------------------------- | ------ | ------------------------------------- |
| `member-list.tsx`             | Server | Grid of member cards                  |
| `member-list-page.tsx`        | Client | Member list page with search          |
| `member-form.tsx`             | Client | Create / edit form                    |
| `member-stats-bar.tsx`        | Server | Meetings + actions + interval metrics |
| `member-quick-actions.tsx`    | Client | Pending actions quick list            |
| `member-actions-dropdown.tsx` | Client | Dropdown menu for member actions      |
| `member-edit-dialog.tsx`      | Client | Modal wrapping `member-form`          |
| `member-delete-dialog.tsx`    | Client | AlertDialog → `deleteMember()`        |
| `member-detail-tab-nav.tsx`   | Client | Tab navigation (overview/history)     |
| `member-timeline.tsx`         | Server | Meeting timeline view                 |
| `mood-trend-chart.tsx`        | Client | recharts LineChart of meeting moods   |
| `checkin-summary-section.tsx` | Server | Check-in condition summary section    |
| `checkin-summary.tsx`         | Client | Check-in trend visualization          |
| `calendar-export-button.tsx`  | Client | iCal export button                    |
| `member-detail-skeleton.tsx`  | —      | Loading skeleton UI                   |
| `member-list-skeleton.tsx`    | —      | Loading skeleton UI                   |

### Meeting (`src/components/meeting/`)

#### Meeting Form / Edit

| Component                  | Type   | Purpose                         |
| -------------------------- | ------ | ------------------------------- |
| `meeting-form.tsx`         | Client | Full create/edit form with DnD  |
| `sortable-topic-item.tsx`  | Client | `@dnd-kit` draggable topic row  |
| `sortable-action-item.tsx` | Client | `@dnd-kit` draggable action row |
| `mood-selector.tsx`        | Client | 1–5 emoji mood scale            |
| `template-selector.tsx`    | Client | Meeting topic template picker   |

#### Meeting Detail / View

| Component                        | Type   | Purpose                               |
| -------------------------------- | ------ | ------------------------------------- |
| `meeting-detail.tsx`             | Server | Read-only meeting view                |
| `meeting-detail-header.tsx`      | Server | Meeting detail page header            |
| `meeting-detail-page-client.tsx` | Client | Client wrapper (edit/delete handlers) |
| `meeting-header-actions.tsx`     | Client | Header action buttons (print/export)  |
| `meeting-navigation.tsx`         | Client | Prev/next meeting navigation          |
| `print-button.tsx`               | Client | Browser print / PDF save button       |
| `export-dialog.tsx`              | Client | CSV export dialog                     |
| `meeting-summary.tsx`            | Client | Meeting summary panel                 |
| `topic-list-section.tsx`         | Server | Read-only topic list                  |
| `action-list-section.tsx`        | Server | Read-only action item list            |
| `meeting-delete-dialog.tsx`      | Client | AlertDialog → `deleteMeeting()`       |

#### Recording Mode (real-time)

| Component                  | Type   | Purpose                                  |
| -------------------------- | ------ | ---------------------------------------- |
| `recording-mode.tsx`       | Client | Real-time meeting recording orchestrator |
| `recording-topic-item.tsx` | Client | In-meeting topic item with inline notes  |
| `elapsed-timer.tsx`        | Client | Meeting elapsed time display             |
| `auto-save-indicator.tsx`  | Client | Auto-save status indicator               |
| `focus-mode-indicator.tsx` | Client | Focus mode (minimal UI) toggle indicator |
| `checkin-section.tsx`      | Client | Check-in health/mood/workload input      |
| `condition-selector.tsx`   | Client | Condition score selector (1–5)           |
| `condition-bar.tsx`        | Client | Visual condition bar display             |
| `icebreaker-card.tsx`      | Client | Icebreaker question suggestion card      |
| `closing-dialog.tsx`       | Client | Meeting close confirmation dialog        |

#### Coaching Assist

| Component               | Type   | Purpose                               |
| ----------------------- | ------ | ------------------------------------- |
| `coaching-panel.tsx`    | Client | Desktop side panel for coaching tips  |
| `coaching-sheet.tsx`    | Client | Mobile bottom sheet for coaching tips |
| `coaching-tip-card.tsx` | Client | Individual coaching tip card          |

#### Meeting Prepare

| Component                      | Type   | Purpose                             |
| ------------------------------ | ------ | ----------------------------------- |
| `meeting-prepare.tsx`          | Client | Preparation checklist view          |
| `prepare-action-checklist.tsx` | Client | Pending actions checkbox list       |
| `prepare-topic-item.tsx`       | Client | Editable topic item for preparation |
| `carryover-action-list.tsx`    | Client | Carry-over incomplete actions list  |
| `previous-meeting-review.tsx`  | Client | Previous meeting notes review       |

#### History / Navigation

| Component                      | Type   | Purpose                            |
| ------------------------------ | ------ | ---------------------------------- |
| `meeting-history.tsx`          | Client | Paginated past meetings list       |
| `past-meetings-accordion.tsx`  | Client | Collapsible past meeting summaries |
| `previous-meeting-sidebar.tsx` | Server | Reference panel (read-only)        |
| `new-meeting-dialog.tsx`       | Client | Quick meeting creation modal       |

#### Settings

| Component                  | Type   | Purpose                                |
| -------------------------- | ------ | -------------------------------------- |
| `template-management.tsx`  | Client | Template list / create / edit / delete |
| `template-form-dialog.tsx` | Client | Template create/edit dialog            |

### Action (`src/components/action/`)

| Component                  | Purpose                              |
| -------------------------- | ------------------------------------ |
| `action-list-full.tsx`     | Full list with member info + filters |
| `action-list-compact.tsx`  | Compact list for member detail       |
| `action-filters.tsx`       | Status / member / tag filter UI      |
| `action-pagination.tsx`    | Pagination controls                  |
| `due-date-badge.tsx`       | Due date color-coded badge           |
| `action-list-skeleton.tsx` | Loading skeleton UI                  |

### Analytics (`src/components/analytics/`)

| Component                           | Chart Type / Purpose             |
| ----------------------------------- | -------------------------------- |
| `analytics-filter-bar.tsx`          | Date range + member filter bar   |
| `meeting-frequency-chart.tsx`       | recharts Bar (12-month)          |
| `meeting-heatmap.tsx`               | recharts Heatmap (day-of-week)   |
| `meeting-interval-table.tsx`        | Native table                     |
| `topic-distribution-chart.tsx`      | recharts Pie                     |
| `topic-trend-chart.tsx`             | recharts Area                    |
| `topic-analytics-section.tsx`       | Topic analytics section wrapper  |
| `action-kpi-cards.tsx`              | 3 metric cards                   |
| `action-completion-trend-chart.tsx` | recharts Bar (monthly)           |
| `action-analytics-section.tsx`      | Action analytics section wrapper |
| `checkin-trend-section.tsx`         | Check-in condition trend charts  |

### Tag (`src/components/tag/`)

| Component        | Purpose                        |
| ---------------- | ------------------------------ |
| `tag-input.tsx`  | Autocomplete + inline create   |
| `tag-badge.tsx`  | Colored chip (optional remove) |
| `tag-filter.tsx` | Multi-select filter            |

### UI (`src/components/ui/`)

shadcn/ui base: `button`, `input`, `label`, `textarea`, `select`, `dialog`, `alert-dialog`, `accordion`, `badge`, `card`, `separator`, `table`, `sonner`, `sheet`, `dropdown-menu`, `calendar`, `popover`, `skeleton`

Custom: `avatar-initial.tsx` (initials + gradient), `empty-state.tsx` (icon + message)

## Custom Hooks (`src/hooks/`)

| Hook                         | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `use-debounce.ts`            | Debounce value changes                |
| `use-elapsed-time.ts`        | Meeting elapsed time tracking         |
| `use-chart-mounted.ts`       | recharts mount state management       |
| `use-keyboard-shortcuts.ts`  | Keyboard shortcut registration        |
| `use-bulk-selection.ts`      | Multi-item selection state            |
| `use-meeting-form.ts`        | Meeting form state & submission logic |
| `use-meeting-detail-page.ts` | Meeting detail page state management  |
| `use-meeting-prepare.ts`     | Meeting preparation flow state        |
| `use-recording-session.ts`   | Real-time recording session state     |
| `use-reduced-motion.ts`      | Reduced motion media query            |

## Server vs Client Component Split

- **Server** (default): data fetching, no interactivity, no browser APIs
- **Client** (`"use client"`): forms, state, DnD, charts, event handlers, toasts

## Design System

- **Theme**: OKLch color palette in `globals.css`; `--primary` indigo `oklch(0.55 0.2 270)`
- **Fonts**: Geist Sans + Noto Sans JP
- **Animations**: `animate-fade-in-up`, `animate-slide-in`, `animate-badge-bounce`, `stagger-1..5`
- **Responsive**: mobile-first Tailwind (`sm:`, `lg:` breakpoints), hamburger menu on mobile

## Meeting Form Tree

```
meeting-form.tsx (Client, DnD state)
├── checkin-section.tsx
│   ├── condition-selector.tsx × 3 (health/mood/workload)
│   └── condition-bar.tsx × 3
├── mood-selector.tsx
├── DndContext (topics)
│   └── sortable-topic-item.tsx × N
│       └── tag-input.tsx
├── DndContext (action items)
│   └── sortable-action-item.tsx × N
│       └── tag-input.tsx
└── Submit → createMeeting() / updateMeeting()
```

## Recording Mode Tree

```
recording-mode.tsx (Client, real-time state)
├── elapsed-timer.tsx
├── auto-save-indicator.tsx
├── focus-mode-indicator.tsx
├── icebreaker-card.tsx
├── checkin-section.tsx
├── recording-topic-item.tsx × N
├── coaching-panel.tsx (desktop)
├── coaching-sheet.tsx (mobile)
└── closing-dialog.tsx
```

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
