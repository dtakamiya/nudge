# 1on1 Log & Action Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal 1on1 meeting log and action tracker with automatic carryover of previous topics and action progress visualization.

**Architecture:** Next.js 15 App Router with Server Actions for data mutations. Prisma ORM with SQLite for local-only persistence. Structured forms for topic entry with category classification. Two-panel layout for new meetings showing previous log alongside input form.

**Tech Stack:** Next.js 15, Prisma, SQLite, Tailwind CSS, shadcn/ui, Zod, Vitest, Testing Library

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project created with App Router structure in `src/` directory.

**Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts at http://localhost:3000 with default Next.js page.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Install and Configure Prisma + SQLite

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Modify: `package.json` (dependencies)

**Step 1: Install Prisma**

Run:
```bash
npm install prisma --save-dev
npm install @prisma/client
```

**Step 2: Initialize Prisma with SQLite**

Run: `npx prisma init --datasource-provider sqlite`
Expected: Creates `prisma/schema.prisma` with SQLite datasource.

**Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: add Prisma with SQLite datasource"
```

---

### Task 3: Define Database Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Write the full Prisma schema**

Replace contents of `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Member {
  id         String   @id @default(uuid())
  name       String
  department String?
  position   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  meetings    Meeting[]
  actionItems ActionItem[]
}

model Meeting {
  id        String   @id @default(uuid())
  memberId  String
  date      DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  member      Member       @relation(fields: [memberId], references: [id], onDelete: Cascade)
  topics      Topic[]
  actionItems ActionItem[]

  @@index([memberId])
}

model Topic {
  id        String        @id @default(uuid())
  meetingId String
  category  TopicCategory
  title     String
  notes     String        @default("")
  sortOrder Int           @default(0)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  @@index([meetingId])
}

enum TopicCategory {
  WORK_PROGRESS
  CAREER
  ISSUES
  FEEDBACK
  OTHER
}

model ActionItem {
  id          String           @id @default(uuid())
  meetingId   String
  memberId    String
  title       String
  description String           @default("")
  status      ActionItemStatus @default(TODO)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  member  Member  @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([meetingId])
  @@index([memberId])
  @@index([status])
}

enum ActionItemStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

**Step 2: Run migration**

Run: `npx prisma migrate dev --name init`
Expected: Migration created and applied. `prisma/dev.db` created.

**Step 3: Add `prisma/dev.db` to .gitignore**

Append to `.gitignore`:
```
prisma/dev.db
prisma/dev.db-journal
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: define database schema with Member, Meeting, Topic, ActionItem models"
```

---

### Task 4: Install and Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `src/lib/__tests__/prisma.test.ts`
- Modify: `package.json` (scripts, dependencies)

**Step 1: Install Vitest and Testing Library**

Run:
```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 2: Create Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3: Add test script to package.json**

Add to `scripts` in `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Write a smoke test for Prisma client import**

Create `src/lib/__tests__/prisma.test.ts`:
```typescript
import { describe, it, expect } from "vitest";

describe("prisma client", () => {
  it("exports prisma instance", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(prisma).toBeDefined();
  });
});
```

**Step 5: Run tests**

Run: `npm test`
Expected: 1 test passes.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest with React Testing Library"
```

---

### Task 5: Zod Validation Schemas

**Files:**
- Create: `src/lib/validations/member.ts`, `src/lib/validations/meeting.ts`, `src/lib/validations/action-item.ts`
- Create: `src/lib/validations/__tests__/member.test.ts`, `src/lib/validations/__tests__/meeting.test.ts`, `src/lib/validations/__tests__/action-item.test.ts`

**Step 1: Install Zod**

Run: `npm install zod`

**Step 2: Write failing tests for member validation**

Create `src/lib/validations/__tests__/member.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createMemberSchema, updateMemberSchema } from "../member";

describe("createMemberSchema", () => {
  it("accepts valid input", () => {
    const result = createMemberSchema.safeParse({
      name: "Tanaka Taro",
      department: "Engineering",
      position: "Senior Engineer",
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = createMemberSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createMemberSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("allows optional department and position", () => {
    const result = createMemberSchema.safeParse({ name: "Suzuki Hanako" });
    expect(result.success).toBe(true);
  });
});

describe("updateMemberSchema", () => {
  it("accepts partial updates", () => {
    const result = updateMemberSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });
});
```

**Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — module not found.

**Step 4: Implement member validation**

Create `src/lib/validations/member.ts`:
```typescript
import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(1, "名前は必須です").optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
```

**Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: All member validation tests pass.

**Step 6: Write failing tests for meeting validation**

Create `src/lib/validations/__tests__/meeting.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createMeetingSchema } from "../meeting";

describe("createMeetingSchema", () => {
  it("accepts valid input with topics and actions", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [
        {
          category: "WORK_PROGRESS",
          title: "Sprint progress",
          notes: "On track",
          sortOrder: 0,
        },
      ],
      actionItems: [
        {
          title: "Review PR",
          description: "",
          dueDate: "2026-02-25",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("requires memberId", () => {
    const result = createMeetingSchema.safeParse({
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires date", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates topic category enum", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [
        {
          category: "INVALID",
          title: "Test",
          notes: "",
          sortOrder: 0,
        },
      ],
      actionItems: [],
    });
    expect(result.success).toBe(false);
  });

  it("allows empty topics and actions", () => {
    const result = createMeetingSchema.safeParse({
      memberId: "some-uuid",
      date: "2026-02-20T10:00:00.000Z",
      topics: [],
      actionItems: [],
    });
    expect(result.success).toBe(true);
  });
});
```

**Step 7: Implement meeting validation**

Create `src/lib/validations/meeting.ts`:
```typescript
import { z } from "zod";

const topicCategory = z.enum([
  "WORK_PROGRESS",
  "CAREER",
  "ISSUES",
  "FEEDBACK",
  "OTHER",
]);

const topicInputSchema = z.object({
  category: topicCategory,
  title: z.string().min(1, "話題のタイトルは必須です"),
  notes: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
});

const actionItemInputSchema = z.object({
  title: z.string().min(1, "アクションのタイトルは必須です"),
  description: z.string().default(""),
  dueDate: z.string().optional(),
});

export const createMeetingSchema = z.object({
  memberId: z.string().min(1, "メンバーIDは必須です"),
  date: z.string().min(1, "日付は必須です"),
  topics: z.array(topicInputSchema),
  actionItems: z.array(actionItemInputSchema),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type TopicInput = z.infer<typeof topicInputSchema>;
export type ActionItemInput = z.infer<typeof actionItemInputSchema>;
```

**Step 8: Run tests to verify they pass**

Run: `npm test`
Expected: All meeting validation tests pass.

**Step 9: Write failing tests for action-item validation**

Create `src/lib/validations/__tests__/action-item.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { updateActionItemStatusSchema } from "../action-item";

describe("updateActionItemStatusSchema", () => {
  it("accepts valid status", () => {
    const result = updateActionItemStatusSchema.safeParse({
      status: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateActionItemStatusSchema.safeParse({
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
      const result = updateActionItemStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });
});
```

**Step 10: Implement action-item validation**

Create `src/lib/validations/action-item.ts`:
```typescript
import { z } from "zod";

export const actionItemStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const updateActionItemStatusSchema = z.object({
  status: actionItemStatus,
});

export type ActionItemStatusType = z.infer<typeof actionItemStatus>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;
```

**Step 11: Run all tests**

Run: `npm test`
Expected: All validation tests pass.

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: add Zod validation schemas for member, meeting, and action-item"
```

---

### Task 6: Server Actions — Members

**Files:**
- Create: `src/lib/actions/member-actions.ts`
- Create: `src/lib/actions/__tests__/member-actions.test.ts`

**Step 1: Write failing tests for member server actions**

Create `src/lib/actions/__tests__/member-actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getMembers, getMember, createMember, updateMember, deleteMember } from "../member-actions";

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
});

describe("createMember", () => {
  it("creates a member with valid data", async () => {
    const result = await createMember({
      name: "Tanaka Taro",
      department: "Engineering",
      position: "Senior",
    });
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Tanaka Taro");
    expect(result.department).toBe("Engineering");
  });
});

describe("getMembers", () => {
  it("returns all members", async () => {
    await createMember({ name: "Member A" });
    await createMember({ name: "Member B" });
    const members = await getMembers();
    expect(members).toHaveLength(2);
  });
});

describe("getMember", () => {
  it("returns member by id", async () => {
    const created = await createMember({ name: "Test Member" });
    const found = await getMember(created.id);
    expect(found?.name).toBe("Test Member");
  });

  it("returns null for non-existent id", async () => {
    const found = await getMember("non-existent");
    expect(found).toBeNull();
  });
});

describe("updateMember", () => {
  it("updates member fields", async () => {
    const created = await createMember({ name: "Old Name" });
    const updated = await updateMember(created.id, { name: "New Name" });
    expect(updated.name).toBe("New Name");
  });
});

describe("deleteMember", () => {
  it("deletes member by id", async () => {
    const created = await createMember({ name: "To Delete" });
    await deleteMember(created.id);
    const found = await getMember(created.id);
    expect(found).toBeNull();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — member-actions module not found.

**Step 3: Implement member server actions**

Create `src/lib/actions/member-actions.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations/member";
import type { CreateMemberInput, UpdateMemberInput } from "@/lib/validations/member";

export async function getMembers() {
  return prisma.member.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          actionItems: {
            where: { status: { not: "DONE" } },
          },
        },
      },
      meetings: {
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
  });
}

export async function getMember(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      meetings: {
        orderBy: { date: "desc" },
        include: {
          topics: { orderBy: { sortOrder: "asc" } },
          actionItems: true,
        },
      },
      actionItems: {
        orderBy: { createdAt: "desc" },
        include: { meeting: { select: { date: true } } },
      },
    },
  });
}

export async function createMember(input: CreateMemberInput) {
  const validated = createMemberSchema.parse(input);
  return prisma.member.create({ data: validated });
}

export async function updateMember(id: string, input: UpdateMemberInput) {
  const validated = updateMemberSchema.parse(input);
  return prisma.member.update({ where: { id }, data: validated });
}

export async function deleteMember(id: string) {
  return prisma.member.delete({ where: { id } });
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All member action tests pass.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add member server actions with CRUD operations"
```

---

### Task 7: Server Actions — Meetings

**Files:**
- Create: `src/lib/actions/meeting-actions.ts`
- Create: `src/lib/actions/__tests__/meeting-actions.test.ts`

**Step 1: Write failing tests for meeting server actions**

Create `src/lib/actions/__tests__/meeting-actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { createMeeting, getMeeting, getPreviousMeeting } from "../meeting-actions";
import { createMember } from "../member-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await createMember({ name: "Test Member" });
  memberId = member.id;
});

describe("createMeeting", () => {
  it("creates meeting with topics and action items", async () => {
    const result = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [
        { category: "WORK_PROGRESS", title: "Sprint review", notes: "Good progress", sortOrder: 0 },
      ],
      actionItems: [
        { title: "Fix bug #123", description: "Critical bug", dueDate: "2026-03-01" },
      ],
    });
    expect(result.id).toBeDefined();
    expect(result.topics).toHaveLength(1);
    expect(result.actionItems).toHaveLength(1);
    expect(result.actionItems[0].memberId).toBe(memberId);
  });
});

describe("getMeeting", () => {
  it("returns meeting with topics and actions", async () => {
    const created = await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [{ category: "CAREER", title: "Growth plan", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    const found = await getMeeting(created.id);
    expect(found?.topics).toHaveLength(1);
    expect(found?.topics[0].category).toBe("CAREER");
  });
});

describe("getPreviousMeeting", () => {
  it("returns the most recent meeting for a member", async () => {
    await createMeeting({
      memberId,
      date: "2026-01-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "Old topic", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    await createMeeting({
      memberId,
      date: "2026-02-01T10:00:00.000Z",
      topics: [{ category: "OTHER", title: "Recent topic", notes: "", sortOrder: 0 }],
      actionItems: [],
    });
    const previous = await getPreviousMeeting(memberId);
    expect(previous?.topics[0].title).toBe("Recent topic");
  });

  it("returns null when no meetings exist", async () => {
    const previous = await getPreviousMeeting(memberId);
    expect(previous).toBeNull();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — meeting-actions module not found.

**Step 3: Implement meeting server actions**

Create `src/lib/actions/meeting-actions.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { createMeetingSchema } from "@/lib/validations/meeting";
import type { CreateMeetingInput } from "@/lib/validations/meeting";

export async function createMeeting(input: CreateMeetingInput) {
  const validated = createMeetingSchema.parse(input);

  return prisma.meeting.create({
    data: {
      memberId: validated.memberId,
      date: new Date(validated.date),
      topics: {
        create: validated.topics.map((topic) => ({
          category: topic.category,
          title: topic.title,
          notes: topic.notes,
          sortOrder: topic.sortOrder,
        })),
      },
      actionItems: {
        create: validated.actionItems.map((item) => ({
          memberId: validated.memberId,
          title: item.title,
          description: item.description,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        })),
      },
    },
    include: {
      topics: { orderBy: { sortOrder: "asc" } },
      actionItems: true,
    },
  });
}

export async function getMeeting(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      member: true,
      topics: { orderBy: { sortOrder: "asc" } },
      actionItems: true,
    },
  });
}

export async function getPreviousMeeting(memberId: string, excludeMeetingId?: string) {
  return prisma.meeting.findFirst({
    where: {
      memberId,
      ...(excludeMeetingId ? { id: { not: excludeMeetingId } } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      topics: { orderBy: { sortOrder: "asc" } },
      actionItems: true,
    },
  });
}

export async function deleteMeeting(id: string) {
  return prisma.meeting.delete({ where: { id } });
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All meeting action tests pass.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add meeting server actions with topic and action item creation"
```

---

### Task 8: Server Actions — Action Items

**Files:**
- Create: `src/lib/actions/action-item-actions.ts`
- Create: `src/lib/actions/__tests__/action-item-actions.test.ts`

**Step 1: Write failing tests for action item server actions**

Create `src/lib/actions/__tests__/action-item-actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getActionItems, getPendingActionItems, updateActionItemStatus } from "../action-item-actions";
import { createMember } from "../member-actions";
import { createMeeting } from "../meeting-actions";

let memberId: string;

beforeEach(async () => {
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();
  const member = await createMember({ name: "Test Member" });
  memberId = member.id;
});

describe("getActionItems", () => {
  it("returns all action items with member and meeting info", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    const items = await getActionItems();
    expect(items).toHaveLength(1);
    expect(items[0].member).toBeDefined();
  });

  it("filters by status", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Task A", description: "" },
        { title: "Task B", description: "" },
      ],
    });
    const items = await getActionItems();
    expect(items).toHaveLength(2);

    await updateActionItemStatus(items[0].id, "DONE");
    const todoItems = await getActionItems({ status: "TODO" });
    expect(todoItems).toHaveLength(1);
    expect(todoItems[0].title).toBe("Task B");
  });

  it("filters by member", async () => {
    const member2 = await createMember({ name: "Member 2" });
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task A", description: "" }],
    });
    await createMeeting({
      memberId: member2.id,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task B", description: "" }],
    });
    const filtered = await getActionItems({ memberId });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Task A");
  });
});

describe("getPendingActionItems", () => {
  it("returns only non-DONE items for a member", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [
        { title: "Pending", description: "" },
        { title: "Done", description: "" },
      ],
    });
    const all = await getActionItems();
    await updateActionItemStatus(all.find((a) => a.title === "Done")!.id, "DONE");

    const pending = await getPendingActionItems(memberId);
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe("Pending");
  });
});

describe("updateActionItemStatus", () => {
  it("updates status to IN_PROGRESS", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const updated = await updateActionItemStatus(items[0].id, "IN_PROGRESS");
    expect(updated.status).toBe("IN_PROGRESS");
    expect(updated.completedAt).toBeNull();
  });

  it("sets completedAt when marking DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    const updated = await updateActionItemStatus(items[0].id, "DONE");
    expect(updated.status).toBe("DONE");
    expect(updated.completedAt).not.toBeNull();
  });

  it("clears completedAt when reverting from DONE", async () => {
    await createMeeting({
      memberId,
      date: new Date().toISOString(),
      topics: [],
      actionItems: [{ title: "Task", description: "" }],
    });
    const items = await getActionItems();
    await updateActionItemStatus(items[0].id, "DONE");
    const reverted = await updateActionItemStatus(items[0].id, "TODO");
    expect(reverted.completedAt).toBeNull();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — action-item-actions module not found.

**Step 3: Implement action item server actions**

Create `src/lib/actions/action-item-actions.ts`:
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

type ActionItemFilters = {
  status?: ActionItemStatusType;
  memberId?: string;
};

export async function getActionItems(filters: ActionItemFilters = {}) {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.memberId) where.memberId = filters.memberId;

  return prisma.actionItem.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      member: { select: { id: true, name: true } },
      meeting: { select: { id: true, date: true } },
    },
  });
}

export async function getPendingActionItems(memberId: string) {
  return prisma.actionItem.findMany({
    where: {
      memberId,
      status: { not: "DONE" },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      meeting: { select: { id: true, date: true } },
    },
  });
}

export async function updateActionItemStatus(id: string, status: ActionItemStatusType) {
  const completedAt = status === "DONE" ? new Date() : null;
  return prisma.actionItem.update({
    where: { id },
    data: { status, completedAt },
  });
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All action item tests pass.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add action item server actions with filtering and status updates"
```

---

### Task 9: Install shadcn/ui and Create Layout

**Files:**
- Create: `components.json`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/textarea.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

**Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```
Expected: Creates `components.json` and sets up shadcn/ui.

**Step 2: Install required shadcn/ui components**

Run:
```bash
npx shadcn@latest add button card input select badge textarea label separator dialog
```

**Step 3: Create the root layout with sidebar navigation**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nudge - 1on1 Tracker",
  description: "1on1ログ & アクショントラッカー",
};

function Sidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
      <Link href="/" className="text-xl font-bold mb-6 block">
        Nudge
      </Link>
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          ダッシュボード
        </Link>
        <Link
          href="/members/new"
          className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          メンバー追加
        </Link>
        <Link
          href="/actions"
          className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          アクション一覧
        </Link>
      </nav>
    </aside>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </body>
    </html>
  );
}
```

**Step 4: Verify the layout renders**

Run: `npm run dev`
Expected: Sidebar navigation visible with "Nudge" title and 3 nav links.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui components and sidebar layout"
```

---

### Task 10: Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/member/member-list.tsx`

**Step 1: Create MemberList component**

Create `src/components/member/member-list.tsx`:
```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP");
}

export function MemberList({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>メンバーがまだ登録されていません</p>
        <Link href="/members/new">
          <Button className="mt-4">メンバーを追加</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <Link
                  href={`/members/${member.id}`}
                  className="font-medium hover:underline"
                >
                  {member.name}
                </Link>
                <div className="text-sm text-gray-500">
                  {[member.department, member.position]
                    .filter(Boolean)
                    .join(" / ")}
                </div>
              </div>
              {member._count.actionItems > 0 && (
                <Badge variant="secondary">
                  未完了 {member._count.actionItems}件
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {member.meetings[0]
                  ? `最終: ${formatDate(member.meetings[0].date)}`
                  : "未実施"}
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

**Step 2: Create dashboard page**

Modify `src/app/page.tsx`:
```tsx
import { getMembers } from "@/lib/actions/member-actions";
import { MemberList } from "@/components/member/member-list";

export default async function DashboardPage() {
  const members = await getMembers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <MemberList members={members} />
    </div>
  );
}
```

**Step 3: Verify dashboard renders**

Run: `npm run dev`
Expected: Dashboard shows empty state with "メンバーを追加" button.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dashboard page with member list"
```

---

### Task 11: New Member Page

**Files:**
- Create: `src/app/members/new/page.tsx`
- Create: `src/components/member/member-form.tsx`

**Step 1: Create MemberForm client component**

Create `src/components/member/member-form.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMember } from "@/lib/actions/member-actions";

export function MemberForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const department = (formData.get("department") as string) || undefined;
    const position = (formData.get("position") as string) || undefined;

    try {
      await createMember({ name, department, position });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>メンバー登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">名前 *</Label>
            <Input id="name" name="name" required placeholder="例: 田中太郎" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="department">部署</Label>
            <Input
              id="department"
              name="department"
              placeholder="例: エンジニアリング"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="position">役職</Label>
            <Input
              id="position"
              name="position"
              placeholder="例: シニアエンジニア"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Create the page**

Create `src/app/members/new/page.tsx`:
```tsx
import { MemberForm } from "@/components/member/member-form";

export default function NewMemberPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
```

**Step 3: Verify form works**

Run: `npm run dev`
Navigate to `/members/new`. Fill in name, submit. Verify redirect to dashboard with member shown.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add new member registration page"
```

---

### Task 12: Member Detail Page

**Files:**
- Create: `src/app/members/[id]/page.tsx`
- Create: `src/components/meeting/meeting-history.tsx`
- Create: `src/components/action/action-list-compact.tsx`

**Step 1: Create MeetingHistory component**

Create `src/components/meeting/meeting-history.tsx`:
```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TopicSummary = {
  id: string;
  category: string;
  title: string;
};

type MeetingSummary = {
  id: string;
  date: Date;
  memberId: string;
  topics: TopicSummary[];
  actionItems: { id: string; status: string }[];
};

type Props = {
  meetings: MeetingSummary[];
  memberId: string;
};

const categoryLabels: Record<string, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・相談",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP");
}

export function MeetingHistory({ meetings, memberId }: Props) {
  if (meetings.length === 0) {
    return <p className="text-gray-500 py-4">まだ1on1の記録がありません</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {meetings.map((meeting) => {
        const doneCount = meeting.actionItems.filter(
          (a) => a.status === "DONE"
        ).length;
        return (
          <Link
            key={meeting.id}
            href={`/members/${memberId}/meetings/${meeting.id}`}
          >
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{formatDate(meeting.date)}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {meeting.topics.map((topic) => (
                        <Badge key={topic.id} variant="outline" className="text-xs">
                          {categoryLabels[topic.category] ?? topic.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    アクション: {doneCount}/{meeting.actionItems.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
```

**Step 2: Create ActionListCompact component**

Create `src/components/action/action-list-compact.tsx`:
```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { useRouter } from "next/navigation";

type ActionItemRow = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  actionItems: ActionItemRow[];
};

const statusLabels: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ja-JP");
}

export function ActionListCompact({ actionItems }: Props) {
  const router = useRouter();

  if (actionItems.length === 0) {
    return <p className="text-gray-500 py-4">アクションアイテムはありません</p>;
  }

  async function cycleStatus(id: string, currentStatus: string) {
    const next =
      currentStatus === "TODO"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
          ? "DONE"
          : "TODO";
    await updateActionItemStatus(id, next as "TODO" | "IN_PROGRESS" | "DONE");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {actionItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-2 border rounded"
        >
          <div className="flex items-center gap-2">
            <button onClick={() => cycleStatus(item.id, item.status)}>
              <Badge variant={statusColors[item.status]}>
                {statusLabels[item.status]}
              </Badge>
            </button>
            <span className="text-sm">{item.title}</span>
          </div>
          {item.dueDate && (
            <span className="text-xs text-gray-500">
              期限: {formatDate(item.dueDate)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Create member detail page**

Create `src/app/members/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMember } from "@/lib/actions/member-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MeetingHistory } from "@/components/meeting/meeting-history";
import { ActionListCompact } from "@/components/action/action-list-compact";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{member.name}</h1>
          <p className="text-gray-500">
            {[member.department, member.position].filter(Boolean).join(" / ")}
          </p>
        </div>
        <Link href={`/members/${id}/meetings/new`}>
          <Button>新規1on1</Button>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-3">1on1履歴</h2>
      <MeetingHistory meetings={member.meetings} memberId={id} />

      <Separator className="my-6" />

      <h2 className="text-lg font-semibold mb-3">アクションアイテム</h2>
      <ActionListCompact actionItems={member.actionItems} />
    </div>
  );
}
```

**Step 4: Verify page renders**

Run: `npm run dev`
Navigate to a member's detail page from dashboard. Verify sections display.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add member detail page with meeting history and action list"
```

---

### Task 13: New 1on1 Meeting Page — Form

**Files:**
- Create: `src/app/members/[id]/meetings/new/page.tsx`
- Create: `src/components/meeting/meeting-form.tsx`

**Step 1: Create MeetingForm client component**

Create `src/components/meeting/meeting-form.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMeeting } from "@/lib/actions/meeting-actions";

type TopicFormData = {
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

type ActionFormData = {
  title: string;
  description: string;
  dueDate: string;
};

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
];

type Props = {
  memberId: string;
};

function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function createEmptyAction(): ActionFormData {
  return { title: "", description: "", dueDate: "" };
}

export function MeetingForm({ memberId }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topics, setTopics] = useState<TopicFormData[]>([createEmptyTopic(0)]);
  const [actionItems, setActionItems] = useState<ActionFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTopic(index: number, field: keyof TopicFormData, value: string | number) {
    setTopics((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  }

  function addAction() {
    setActionItems((prev) => [...prev, createEmptyAction()]);
  }

  function removeAction(index: number) {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAction(index: number, field: keyof ActionFormData, value: string) {
    setActionItems((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const validActions = actionItems.filter((a) => a.title.trim() !== "");

    try {
      await createMeeting({
        memberId,
        date: new Date(date).toISOString(),
        topics: validTopics.map((t) => ({
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: validActions.map((a) => ({
          title: a.title,
          description: a.description,
          dueDate: a.dueDate || undefined,
        })),
      });
      router.push(`/members/${memberId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Date */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">日付 *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Topics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">話題</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTopic}>
              + 話題を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {topics.map((topic, index) => (
            <div key={index} className="border rounded p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>カテゴリ</Label>
                  <Select
                    value={topic.category}
                    onValueChange={(val) => updateTopic(index, "category", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2]">
                  <Label>タイトル</Label>
                  <Input
                    value={topic.title}
                    onChange={(e) => updateTopic(index, "title", e.target.value)}
                    placeholder="話題のタイトル"
                  />
                </div>
                {topics.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTopic(index)}
                  >
                    削除
                  </Button>
                )}
              </div>
              <div>
                <Label>メモ</Label>
                <Textarea
                  value={topic.notes}
                  onChange={(e) => updateTopic(index, "notes", e.target.value)}
                  placeholder="詳細メモ"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">アクションアイテム</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              + アクション追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {actionItems.length === 0 && (
            <p className="text-sm text-gray-500">アクションはまだありません</p>
          )}
          {actionItems.map((action, index) => (
            <div key={index} className="border rounded p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <div className="flex-[2]">
                  <Label>タイトル</Label>
                  <Input
                    value={action.title}
                    onChange={(e) => updateAction(index, "title", e.target.value)}
                    placeholder="アクションのタイトル"
                  />
                </div>
                <div className="flex-1">
                  <Label>期限</Label>
                  <Input
                    type="date"
                    value={action.dueDate}
                    onChange={(e) => updateAction(index, "dueDate", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAction(index)}
                >
                  削除
                </Button>
              </div>
              <div>
                <Label>説明</Label>
                <Input
                  value={action.description}
                  onChange={(e) => updateAction(index, "description", e.target.value)}
                  placeholder="詳細（任意）"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "保存中..." : "1on1を保存"}
      </Button>
    </form>
  );
}
```

**Step 2: Create the new meeting page**

Create `src/app/members/[id]/meetings/new/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getMember } from "@/lib/actions/member-actions";
import { getPreviousMeeting } from "@/lib/actions/meeting-actions";
import { getPendingActionItems } from "@/lib/actions/action-item-actions";
import { MeetingForm } from "@/components/meeting/meeting-form";
import { PreviousMeetingSidebar } from "@/components/meeting/previous-meeting-sidebar";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewMeetingPage({ params }: Props) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const previousMeeting = await getPreviousMeeting(id);
  const pendingActions = await getPendingActionItems(id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {member.name}との1on1
      </h1>
      <div className="flex gap-8">
        <div className="flex-1">
          <MeetingForm memberId={id} />
        </div>
        <div className="w-80 shrink-0">
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

**Step 3: Commit (sidebar component created in next task)**

Hold — do not commit yet. Continue to Task 14.

---

### Task 14: Previous Meeting Sidebar

**Files:**
- Create: `src/components/meeting/previous-meeting-sidebar.tsx`

**Step 1: Create PreviousMeetingSidebar component**

Create `src/components/meeting/previous-meeting-sidebar.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string;
};

type ActionItem = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
};

type MeetingData = {
  id: string;
  date: Date;
  topics: Topic[];
  actionItems: ActionItem[];
} | null;

type Props = {
  previousMeeting: MeetingData;
  pendingActions: ActionItem[];
};

const categoryLabels: Record<string, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・相談",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP");
}

export function PreviousMeetingSidebar({
  previousMeeting,
  pendingActions,
}: Props) {
  const router = useRouter();

  async function markDone(id: string) {
    await updateActionItemStatus(id, "DONE");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pending Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">未完了アクション</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingActions.length === 0 ? (
            <p className="text-sm text-gray-500">なし</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    onChange={() => markDone(action.id)}
                    className="rounded"
                  />
                  <span>{action.title}</span>
                  {action.dueDate && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatDate(action.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Meeting */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {previousMeeting
              ? `前回: ${formatDate(previousMeeting.date)}`
              : "前回の記録"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!previousMeeting ? (
            <p className="text-sm text-gray-500">前回の記録はありません</p>
          ) : (
            <div className="flex flex-col gap-3">
              {previousMeeting.topics.map((topic) => (
                <div key={topic.id}>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[topic.category] ?? topic.category}
                    </Badge>
                    <span className="text-sm font-medium">{topic.title}</span>
                  </div>
                  {topic.notes && (
                    <p className="text-xs text-gray-500 mt-1">{topic.notes}</p>
                  )}
                </div>
              ))}
              {previousMeeting.topics.length === 0 && (
                <p className="text-sm text-gray-500">話題なし</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Verify the new meeting page renders**

Run: `npm run dev`
Navigate to `/members/<id>/meetings/new`. Verify two-panel layout with form on left, sidebar on right.

**Step 3: Commit both Task 13 and Task 14**

```bash
git add -A
git commit -m "feat: add new 1on1 meeting page with form and previous meeting sidebar"
```

---

### Task 15: Meeting Detail Page

**Files:**
- Create: `src/app/members/[id]/meetings/[meetingId]/page.tsx`
- Create: `src/components/meeting/meeting-detail.tsx`

**Step 1: Create MeetingDetail component**

Create `src/components/meeting/meeting-detail.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionListCompact } from "@/components/action/action-list-compact";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

type ActionItem = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  date: Date;
  topics: Topic[];
  actionItems: ActionItem[];
};

const categoryLabels: Record<string, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・相談",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP");
}

export function MeetingDetail({ date, topics, actionItems }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg text-gray-600">{formatDate(date)}</p>

      <div>
        <h2 className="text-lg font-semibold mb-3">話題</h2>
        {topics.length === 0 ? (
          <p className="text-gray-500">話題なし</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {categoryLabels[topic.category] ?? topic.category}
                    </Badge>
                    <span className="font-medium">{topic.title}</span>
                  </div>
                  {topic.notes && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {topic.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-3">アクションアイテム</h2>
        <ActionListCompact
          actionItems={actionItems.map((a) => ({
            ...a,
            meeting: { date: a.meeting.date },
          }))}
        />
      </div>
    </div>
  );
}
```

**Step 2: Create the meeting detail page**

Create `src/app/members/[id]/meetings/[meetingId]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeeting } from "@/lib/actions/meeting-actions";
import { Button } from "@/components/ui/button";
import { MeetingDetail } from "@/components/meeting/meeting-detail";

type Props = {
  params: Promise<{ id: string; meetingId: string }>;
};

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{meeting.member.name}との1on1</h1>
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

**Step 3: Verify the meeting detail page renders**

Run: `npm run dev`
Create a meeting, then click through to view it. Verify topics and actions display.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add meeting detail page with topics and action items"
```

---

### Task 16: Action List Page (Cross-Member)

**Files:**
- Create: `src/app/actions/page.tsx`
- Create: `src/components/action/action-list-full.tsx`
- Create: `src/components/action/action-filters.tsx`

**Step 1: Create ActionFilters component**

Create `src/components/action/action-filters.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Member = {
  id: string;
  name: string;
};

type Props = {
  members: Member[];
};

export function ActionFilters({ members }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/actions?${params.toString()}`);
  }

  return (
    <div className="flex gap-4 mb-4">
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(val) => updateFilter("status", val)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="TODO">未着手</SelectItem>
          <SelectItem value="IN_PROGRESS">進行中</SelectItem>
          <SelectItem value="DONE">完了</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("memberId") ?? "all"}
        onValueChange={(val) => updateFilter("memberId", val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="メンバー" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全メンバー</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Step 2: Create ActionListFull component**

Create `src/components/action/action-list-full.tsx`:
```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateActionItemStatus } from "@/lib/actions/action-item-actions";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
};

type Props = {
  actionItems: ActionItemRow[];
};

const statusLabels: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ja-JP");
}

export function ActionListFull({ actionItems }: Props) {
  const router = useRouter();

  if (actionItems.length === 0) {
    return <p className="text-gray-500 py-8 text-center">アクションアイテムはありません</p>;
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await updateActionItemStatus(id, newStatus as "TODO" | "IN_PROGRESS" | "DONE");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {actionItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select
                value={item.status}
                onValueChange={(val) => handleStatusChange(item.id, val)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">未着手</SelectItem>
                  <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                  <SelectItem value="DONE">完了</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  <Link
                    href={`/members/${item.member.id}`}
                    className="hover:underline"
                  >
                    {item.member.name}
                  </Link>
                  {" ・ "}
                  {formatDate(item.meeting.date)}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {item.dueDate && `期限: ${formatDate(item.dueDate)}`}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Step 3: Create the actions page**

Create `src/app/actions/page.tsx`:
```tsx
import { Suspense } from "react";
import { getActionItems } from "@/lib/actions/action-item-actions";
import { getMembers } from "@/lib/actions/member-actions";
import { ActionListFull } from "@/components/action/action-list-full";
import { ActionFilters } from "@/components/action/action-filters";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

type Props = {
  searchParams: Promise<{ status?: string; memberId?: string }>;
};

export default async function ActionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters: { status?: ActionItemStatusType; memberId?: string } = {};

  if (params.status && ["TODO", "IN_PROGRESS", "DONE"].includes(params.status)) {
    filters.status = params.status as ActionItemStatusType;
  }
  if (params.memberId) {
    filters.memberId = params.memberId;
  }

  const [actionItems, members] = await Promise.all([
    getActionItems(filters),
    getMembers(),
  ]);

  const memberList = members.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アクション一覧</h1>
      <Suspense>
        <ActionFilters members={memberList} />
      </Suspense>
      <ActionListFull actionItems={actionItems} />
    </div>
  );
}
```

**Step 4: Verify the actions page renders**

Run: `npm run dev`
Navigate to `/actions`. Verify filters and list display. Test filtering by status and member.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add cross-member action list page with status and member filters"
```

---

### Task 17: Run Full Test Suite and Verify Build

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass.

**Step 2: Verify production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit any fixes if needed**

If tests or build fail, fix issues and commit:
```bash
git add -A
git commit -m "fix: resolve build/test issues"
```

---

### Task 18: Seed Data for Development

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (prisma seed config)

**Step 1: Install ts-node for seeding**

Run: `npm install --save-dev tsx`

**Step 2: Create seed script**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.actionItem.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.member.deleteMany();

  // Create members
  const tanaka = await prisma.member.create({
    data: { name: "田中太郎", department: "エンジニアリング", position: "シニアエンジニア" },
  });

  const suzuki = await prisma.member.create({
    data: { name: "鈴木花子", department: "プロダクト", position: "プロダクトマネージャー" },
  });

  const sato = await prisma.member.create({
    data: { name: "佐藤次郎", department: "エンジニアリング", position: "エンジニア" },
  });

  // Create meetings with topics and actions
  await prisma.meeting.create({
    data: {
      memberId: tanaka.id,
      date: new Date("2026-02-10"),
      topics: {
        create: [
          { category: "WORK_PROGRESS", title: "Sprint 14 の進捗", notes: "予定通り進行中。APIの実装が完了。", sortOrder: 0 },
          { category: "CAREER", title: "テックリードへのキャリアパス", notes: "Q2からテックリードのロールに挑戦したい。", sortOrder: 1 },
        ],
      },
      actionItems: {
        create: [
          { memberId: tanaka.id, title: "テックリード向け研修を調査", status: "IN_PROGRESS", dueDate: new Date("2026-02-28") },
          { memberId: tanaka.id, title: "コードレビューガイドラインを作成", status: "TODO", dueDate: new Date("2026-03-15") },
        ],
      },
    },
  });

  await prisma.meeting.create({
    data: {
      memberId: suzuki.id,
      date: new Date("2026-02-12"),
      topics: {
        create: [
          { category: "WORK_PROGRESS", title: "新機能のユーザーリサーチ", notes: "5名のインタビュー完了。主要なペインポイントを特定。", sortOrder: 0 },
          { category: "ISSUES", title: "デザインチームとの連携", notes: "コミュニケーション頻度を上げる必要がある。", sortOrder: 1 },
        ],
      },
      actionItems: {
        create: [
          { memberId: suzuki.id, title: "リサーチレポートをまとめる", status: "TODO", dueDate: new Date("2026-02-20") },
          { memberId: suzuki.id, title: "デザインチームと週次ミーティングを設定", status: "DONE", dueDate: new Date("2026-02-15"), completedAt: new Date("2026-02-14") },
        ],
      },
    },
  });

  await prisma.meeting.create({
    data: {
      memberId: sato.id,
      date: new Date("2026-02-14"),
      topics: {
        create: [
          { category: "WORK_PROGRESS", title: "バグ修正タスクの進捗", notes: "3件中2件完了。残り1件は明日完了予定。", sortOrder: 0 },
          { category: "FEEDBACK", title: "ペアプログラミングの効果", notes: "生産性が上がっている。週2回は継続したい。", sortOrder: 1 },
        ],
      },
      actionItems: {
        create: [
          { memberId: sato.id, title: "残りのバグ修正を完了", status: "TODO", dueDate: new Date("2026-02-17") },
        ],
      },
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 3: Add prisma seed config to package.json**

Add to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

**Step 4: Run seed**

Run: `npx prisma db seed`
Expected: "Seed data created successfully!" — 3 members, 3 meetings with topics and action items.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add seed data with sample members, meetings, and action items"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Project scaffolding | 3 |
| 2 | Prisma + SQLite setup | 4 |
| 3 | Database schema | 4 |
| 4 | Vitest configuration | 6 |
| 5 | Zod validation schemas (TDD) | 12 |
| 6 | Member server actions (TDD) | 5 |
| 7 | Meeting server actions (TDD) | 5 |
| 8 | Action item server actions (TDD) | 5 |
| 9 | shadcn/ui + Layout | 5 |
| 10 | Dashboard page | 4 |
| 11 | New member page | 4 |
| 12 | Member detail page | 5 |
| 13 | New meeting page — form | 2 |
| 14 | Previous meeting sidebar | 3 |
| 15 | Meeting detail page | 4 |
| 16 | Action list page with filters | 5 |
| 17 | Full test suite + build verification | 3 |
| 18 | Seed data | 5 |
| **Total** | | **84 steps** |
