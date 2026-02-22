# Backend Structure

<!-- freshness: 2026-02-23 -->

## Server Actions (`src/lib/actions/`)

### Error Handling Foundation (`types.ts`)

```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>>
```

### Action Files

| File                     | Key Exports                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `member-actions.ts`      | `getMembers`, `getMember`, `createMember`, `updateMember`, `deleteMember`, `getMemberMeetings`                             |
| `meeting-actions.ts`     | `createMeeting`, `getMeeting`, `updateMeeting`, `deleteMeeting`, `getPreviousMeeting`, `getMoodTrend`                      |
| `action-item-actions.ts` | `getActionItems`, `updateActionItemStatus`, `updateActionItem`, `getPendingActionItems`                                    |
| `tag-actions.ts`         | `getTags`, `createTag`, `updateTag`, `deleteTag`, `getTagSuggestions`, `getPopularTags`, `getOrCreateTagsInTx`             |
| `dashboard-actions.ts`   | `getDashboardSummary`, `getRecentActivity`, `getUpcomingActions`, `getRecommendedMeetings`, `getScheduledMeetingsThisWeek` |
| `analytics-actions.ts`   | `getMemberTopicTrends`, `getMemberActionTrends`, `getMeetingFrequencyByMonth`                                              |
| `reminder-actions.ts`    | `getOverdueReminders`                                                                                                      |
| `search-actions.ts`      | `searchMembers`, `searchActions`                                                                                           |
| `export-actions.ts`      | `exportMeetingData` (CSV)                                                                                                  |

### Write Flow (createMeeting example)

```
Zod parse → prisma.$transaction → create Meeting
                                 → create Topics
                                 → create ActionItems
                                 → createMany TopicTags
                                 → createMany ActionItemTags
         → revalidatePath("/", "layout")
         → return ActionResult<MeetingWithRelations>
```

## Validation (`src/lib/validations/`)

| File             | Schemas                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `member.ts`      | `createMemberSchema`, `updateMemberSchema`                                                  |
| `meeting.ts`     | `createMeetingSchema` (nested topics + actions + tagIds/newTagNames), `updateMeetingSchema` |
| `action-item.ts` | `updateActionItemSchema`, `updateActionItemStatusSchema`                                    |
| `tag.ts`         | `createTagSchema`, `updateTagSchema`                                                        |
| `search.ts`      | search query schema                                                                         |

## Database (`prisma/schema.prisma`)

### Models

| Model           | Key Fields                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `Member`        | `id` UUID, `name`, `department?`, `position?`, `meetingIntervalDays` int default 14                 |
| `Meeting`       | `id` UUID, `memberId`, `date`, `mood?` (1–5)                                                        |
| `Topic`         | `id` UUID, `meetingId`, `category` enum, `title`, `notes`, `sortOrder`                              |
| `ActionItem`    | `id` UUID, `meetingId`, `memberId`, `title`, `status` enum, `dueDate?`, `completedAt?`, `sortOrder` |
| `Tag`           | `id` UUID, `name` unique, `color` hex                                                               |
| `TopicTag`      | composite PK (`topicId`, `tagId`)                                                                   |
| `ActionItemTag` | composite PK (`actionItemId`, `tagId`)                                                              |

### Enums

```
TopicCategory: WORK_PROGRESS | CAREER | ISSUES | FEEDBACK | OTHER
ActionItemStatus: TODO | IN_PROGRESS | DONE
```

### Indexes

```
Meeting:    @@index([memberId])
Topic:      @@index([meetingId]), @@index([meetingId, sortOrder])
ActionItem: @@index([memberId]), @@index([memberId, status]), @@index([status])
TopicTag:   @@index([tagId])
ActionItemTag: @@index([tagId])
```

## Prisma Client (`src/lib/prisma.ts`)

- Global singleton (prevents dev-mode connection exhaustion)
- Resolves relative `DATABASE_URL` to absolute path
- Test DB: `file:./test.db` (set in `vitest.config.ts`)

## Utilities

| File               | Functions                                                             |
| ------------------ | --------------------------------------------------------------------- |
| `lib/format.ts`    | `formatDate`, `formatDaysElapsed`, `formatRelativeDate`, `toMonthKey` |
| `lib/avatar.ts`    | `getInitials(name)`, `getAvatarGradient(name)`                        |
| `lib/schedule.ts`  | `isOverdue`, `isScheduledThisWeek`, `calcNextRecommendedDate`         |
| `lib/constants.ts` | `MEETINGS_PAGE_SIZE=10`, `CATEGORY_LABELS`, `TAG_COLOR_PALETTE`       |

## Pagination Pattern

```typescript
const [items, total] = await Promise.all([
  prisma.model.findMany({ skip: (page - 1) * size, take: size }),
  prisma.model.count({ where }),
]);
return { items, total, hasNext: skip + items.length < total, hasPrev: page > 1 };
```
