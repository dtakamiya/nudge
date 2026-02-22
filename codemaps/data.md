# Data Models & Schemas

<!-- freshness: 2026-02-23 -->

## Prisma Models

### Member

```prisma
model Member {
  id                  String    @id @default(uuid())
  name                String
  department          String?
  position            String?
  meetingIntervalDays Int       @default(14)  // 7 | 14 | 30
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  meetings            Meeting[]
  actionItems         ActionItem[]
}
```

### Meeting

```prisma
model Meeting {
  id        String    @id @default(uuid())
  memberId  String
  date      DateTime
  mood      Int?      // 1–5
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  member      Member       @relation(...)
  topics      Topic[]
  actionItems ActionItem[]
  @@index([memberId])
}
```

### Topic

```prisma
model Topic {
  id        String        @id @default(uuid())
  meetingId String
  category  TopicCategory
  title     String
  notes     String        @default("")
  sortOrder Int           @default(0)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  meeting   Meeting    @relation(...)
  tags      TopicTag[]
  @@index([meetingId])
  @@index([meetingId, sortOrder])
}
```

### ActionItem

```prisma
model ActionItem {
  id          String           @id @default(uuid())
  meetingId   String
  memberId    String
  title       String
  description String           @default("")
  status      ActionItemStatus @default(TODO)
  sortOrder   Int              @default(0)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  meeting ActionItem[]    @relation(fields: [meetingId], ...)
  member  Member          @relation(fields: [memberId], ...)
  tags    ActionItemTag[]
  @@index([memberId])
  @@index([memberId, status])
  @@index([status])
}
```

### Tag & Junction Tables

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  color     String   @default("#6366f1")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  topics      TopicTag[]
  actionItems ActionItemTag[]
}

model TopicTag {
  topicId String
  tagId   String
  @@id([topicId, tagId])
  @@index([tagId])
}

model ActionItemTag {
  actionItemId String
  tagId        String
  @@id([actionItemId, tagId])
  @@index([tagId])
}
```

## Enums

```typescript
enum TopicCategory {
  WORK_PROGRESS  // 業務進捗
  CAREER         // キャリア
  ISSUES         // 課題
  FEEDBACK       // フィードバック
  OTHER          // その他
}

enum ActionItemStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

## Zod Schemas (`src/lib/validations/`)

### Member

```typescript
createMemberSchema = z.object({
  name: z.string().min(1),
  department: z.string().optional(),
  position: z.string().optional(),
  meetingIntervalDays: z
    .number()
    .refine((v) => [7, 14, 30].includes(v))
    .optional(),
});
updateMemberSchema = createMemberSchema.partial();
```

### Meeting (composite)

```typescript
topicInputSchema = z.object({
  category: z.enum([...TopicCategory]),
  title: z.string().min(1),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

actionItemInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  status: z.enum([...ActionItemStatus]).default("TODO"),
  dueDate: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  tagIds: z.array(z.string().uuid()).default([]),
  newTagNames: z.array(z.string().min(1).max(30)).default([]),
});

createMeetingSchema = z.object({
  memberId: z.string().min(1),
  date: z.string().min(1),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  topics: z.array(topicInputSchema),
  actionItems: z.array(actionItemInputSchema),
});
```

### Tag

```typescript
createTagSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
```

## Extended TypeScript Types (Server Actions)

```typescript
// Member with pre-computed stats
type MemberWithStats = Member & {
  actionItems: ActionItemWithMeeting[];
  lastMeetingDate: Date | null;
  totalMeetingCount: number;
  pendingActionItems: ActionItemWithMeeting[];
};

// Paginated result
type MeetingsPage = {
  meetings: MeetingWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Dashboard KPIs
type DashboardSummary = {
  needsFollowUp: number;
  actionCompletionRate: number;
  totalActions: number;
  completedActions: number;
  meetingsThisMonth: number;
  overdueActions: number;
};
```

## Tag Many-to-Many Pattern

```typescript
// In transaction:
const existingTagIds: string[] = input.tagIds;
const newTags = await getOrCreateTagsInTx(tx, input.newTagNames);
const allTagIds = [...new Set([...existingTagIds, ...newTags.map((t) => t.id)])];

await tx.topicTag.createMany({
  data: allTagIds.map((tagId) => ({ topicId, tagId })),
});
```

## Database Config

```
DATABASE_URL = file:./dev.db     (development, .env)
DATABASE_URL = file:./test.db    (test, vitest.config.ts env)
```

## Constants (`src/lib/constants.ts`)

```typescript
MEETINGS_PAGE_SIZE = 10
CATEGORY_LABELS = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
}
TAG_COLOR_PALETTE = ["#6366f1", "#ec4899", "#f59e0b", ...] // 10 colors
```
