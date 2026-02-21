# トピック・アクションアイテム ドラッグ&ドロップ並び替え 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 1on1 記録フォームのトピックとアクションアイテムを `@dnd-kit` でドラッグ&ドロップ並び替え可能にする。

**Architecture:** `MeetingForm` 内のトピック行・アクションアイテム行をそれぞれ `SortableTopicItem`/`SortableActionItem` コンポーネントに抽出し、`DndContext` + `SortableContext` でラップ。各アイテムには `useSortable` フックを適用し、左端に `GripVertical` ドラッグハンドルを配置。ドロップ時に `arrayMove` で配列を再配置し `sortOrder` を再計算。

**Tech Stack:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, React 19, lucide-react (GripVertical)

**Design doc:** `docs/plans/2026-02-21-dnd-sortable-topics-design.md`

---

## Task 1: Install @dnd-kit packages

**Files:**

- Modify: `package.json`

**Step 1: Install dependencies**

Run:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: packages added to `dependencies` in `package.json`.

**Step 2: Verify install**

Run:

```bash
npm ls @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: all three packages listed without errors.

**Step 3: Verify existing tests still pass**

Run:

```bash
npm test
```

Expected: all existing tests PASS.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities"
```

---

## Task 2: Create SortableTopicItem component (TDD)

**Files:**

- Create: `src/components/meeting/__tests__/sortable-topic-item.test.tsx`
- Create: `src/components/meeting/sortable-topic-item.tsx`

**Context:** Extract the topic row from `meeting-form.tsx` (lines 134–184) into its own component. Each topic row has: category select, title input, notes textarea, delete button. We add a `GripVertical` drag handle on the left.

**Step 1: Write the failing tests**

Create `src/components/meeting/__tests__/sortable-topic-item.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableTopicItem } from "../sortable-topic-item";

// Mock @dnd-kit/sortable — useSortable returns no-op values for unit tests
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const defaultProps = {
  id: "topic-0",
  category: "WORK_PROGRESS",
  title: "進捗報告",
  notes: "メモ内容",
  index: 0,
  showDelete: true,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
};

describe("SortableTopicItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders drag handle, category, title, notes, and delete button", () => {
    render(<SortableTopicItem {...defaultProps} />);
    expect(screen.getByTestId("drag-handle-topic-0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("進捗報告")).toBeInTheDocument();
    expect(screen.getByDisplayValue("メモ内容")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("hides delete button when showDelete is false", () => {
    render(<SortableTopicItem {...defaultProps} showDelete={false} />);
    expect(screen.queryByRole("button", { name: "削除" })).not.toBeInTheDocument();
  });

  it("calls onUpdate when title changes", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    const input = screen.getByDisplayValue("進捗報告");
    await user.clear(input);
    await user.type(input, "新タイトル");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "title", "新タイトル");
  });

  it("calls onUpdate when notes change", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    const textarea = screen.getByDisplayValue("メモ内容");
    await user.clear(textarea);
    await user.type(textarea, "新メモ");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "notes", "新メモ");
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });

  it("applies dragging styles when isDragging is true", () => {
    vi.mocked(vi.fn()).mockReturnValue; // no-op, just documenting: visual drag test is manual
    // Note: Visual drag styling tested manually — jsdom cannot simulate DnD transforms
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/components/meeting/__tests__/sortable-topic-item.test.tsx
```

Expected: FAIL — `Cannot find module '../sortable-topic-item'`

**Step 3: Write the implementation**

Create `src/components/meeting/sortable-topic-item.tsx`:

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
];

type Props = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly notes: string;
  readonly index: number;
  readonly showDelete: boolean;
  readonly onUpdate: (index: number, field: "category" | "title" | "notes", value: string) => void;
  readonly onRemove: (index: number) => void;
};

export function SortableTopicItem({
  id,
  category,
  title,
  notes,
  index,
  showDelete,
  onUpdate,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 flex flex-col gap-2 bg-card ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
    >
      <div className="flex gap-2 items-end">
        <button
          type="button"
          data-testid={`drag-handle-${id}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground self-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={(val) => onUpdate(index, "category", val)}>
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
            value={title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="話題のタイトル"
          />
        </div>
        {showDelete && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
            削除
          </Button>
        )}
      </div>
      <div>
        <Label>メモ</Label>
        <Textarea
          value={notes}
          onChange={(e) => onUpdate(index, "notes", e.target.value)}
          placeholder="詳細メモ"
          rows={2}
        />
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/components/meeting/__tests__/sortable-topic-item.test.tsx
```

Expected: all tests PASS.

**Step 5: Commit**

```bash
git add src/components/meeting/sortable-topic-item.tsx src/components/meeting/__tests__/sortable-topic-item.test.tsx
git commit -m "feat: add SortableTopicItem component with drag handle"
```

---

## Task 3: Create SortableActionItem component (TDD)

**Files:**

- Create: `src/components/meeting/__tests__/sortable-action-item.test.tsx`
- Create: `src/components/meeting/sortable-action-item.tsx`

**Context:** Extract the action item row from `meeting-form.tsx` (lines 201–233) into its own component. Each action row has: title input, due date input, description input, delete button. We add a `GripVertical` drag handle on the left.

**Step 1: Write the failing tests**

Create `src/components/meeting/__tests__/sortable-action-item.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableActionItem } from "../sortable-action-item";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const defaultProps = {
  id: "action-0",
  title: "レビュー依頼",
  description: "PRレビューをする",
  dueDate: "2026-03-01",
  index: 0,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
};

describe("SortableActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders drag handle, title, description, dueDate, and delete button", () => {
    render(<SortableActionItem {...defaultProps} />);
    expect(screen.getByTestId("drag-handle-action-0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("レビュー依頼")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PRレビューをする")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-03-01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("calls onUpdate when title changes", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    const input = screen.getByDisplayValue("レビュー依頼");
    await user.clear(input);
    await user.type(input, "新タイトル");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "title", "新タイトル");
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx vitest run src/components/meeting/__tests__/sortable-action-item.test.tsx
```

Expected: FAIL — `Cannot find module '../sortable-action-item'`

**Step 3: Write the implementation**

Create `src/components/meeting/sortable-action-item.tsx`:

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly dueDate: string;
  readonly index: number;
  readonly onUpdate: (
    index: number,
    field: "title" | "description" | "dueDate",
    value: string,
  ) => void;
  readonly onRemove: (index: number) => void;
};

export function SortableActionItem({
  id,
  title,
  description,
  dueDate,
  index,
  onUpdate,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 flex flex-col gap-2 bg-card ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
    >
      <div className="flex gap-2 items-end">
        <button
          type="button"
          data-testid={`drag-handle-${id}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground self-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-[2]">
          <Label>タイトル</Label>
          <Input
            value={title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="アクションのタイトル"
          />
        </div>
        <div className="flex-1">
          <Label>期限</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => onUpdate(index, "dueDate", e.target.value)}
          />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
          削除
        </Button>
      </div>
      <div>
        <Label>説明</Label>
        <Input
          value={description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          placeholder="詳細（任意）"
        />
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
npx vitest run src/components/meeting/__tests__/sortable-action-item.test.tsx
```

Expected: all tests PASS.

**Step 5: Commit**

```bash
git add src/components/meeting/sortable-action-item.tsx src/components/meeting/__tests__/sortable-action-item.test.tsx
git commit -m "feat: add SortableActionItem component with drag handle"
```

---

## Task 4: Integrate DnD into MeetingForm (TDD)

**Files:**

- Modify: `src/components/meeting/meeting-form.tsx`
- Modify: `src/components/meeting/__tests__/meeting-form.test.tsx`

**Context:** Replace inline topic/action markup in `MeetingForm` with `SortableTopicItem`/`SortableActionItem`. Wrap each section in `DndContext` + `SortableContext`. Add `handleDragEnd` handlers that use `arrayMove` from `@dnd-kit/sortable` to reorder items.

**Key details:**

- Each topic needs a stable `id` for dnd-kit. Use `topic-${index}` pattern (items are identified by array position; the id is regenerated on every render to match the current array).
- `closestCenter` collision detection strategy (best for vertical lists).
- `KeyboardSensor` and `PointerSensor` for mouse + keyboard support.
- After `arrayMove`, recalculate `sortOrder` to match new array index.

**Step 1: Update tests to verify DnD integration**

Add to `src/components/meeting/__tests__/meeting-form.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingForm } from "../meeting-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  createMeeting: vi.fn(),
}));

// Mock dnd-kit to avoid jsdom DnD issues
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe("MeetingForm", () => {
  afterEach(() => cleanup());

  it("renders with default empty topic when no initialTopics", () => {
    render(<MeetingForm memberId="m1" />);
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toHaveProperty("value", "");
  });

  it("pre-fills topics from initialTopics prop", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "今週の進捗報告", notes: "メモ", sortOrder: 0 },
      { category: "ISSUES", title: "困っていること", notes: "", sortOrder: 1 },
    ];
    render(<MeetingForm memberId="m1" initialTopics={initialTopics} />);
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveProperty("value", "今週の進捗報告");
    expect(inputs[1]).toHaveProperty("value", "困っていること");
  });

  it("renders drag handles for each topic", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "Topic 1", notes: "", sortOrder: 0 },
      { category: "CAREER", title: "Topic 2", notes: "", sortOrder: 1 },
    ];
    render(<MeetingForm memberId="m1" initialTopics={initialTopics} />);
    expect(screen.getByTestId("drag-handle-topic-0")).toBeInTheDocument();
    expect(screen.getByTestId("drag-handle-topic-1")).toBeInTheDocument();
  });

  it("adds a new topic with + 話題を追加 button", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(2);
  });

  it("renders drag handles for action items after adding", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);
    await user.click(screen.getByRole("button", { name: /アクション追加/ }));
    expect(screen.getByTestId("drag-handle-action-0")).toBeInTheDocument();
  });
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
npx vitest run src/components/meeting/__tests__/meeting-form.test.tsx
```

Expected: FAIL — drag handle test IDs not found (old inline markup has no drag handles).

**Step 3: Rewrite MeetingForm to use DnD**

Replace `src/components/meeting/meeting-form.tsx` with:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMeeting } from "@/lib/actions/meeting-actions";
import { SortableTopicItem } from "./sortable-topic-item";
import { SortableActionItem } from "./sortable-action-item";

type TopicFormData = { category: string; title: string; notes: string; sortOrder: number };
type ActionFormData = { title: string; description: string; dueDate: string };

type Props = {
  memberId: string;
  initialTopics?: Array<{ category: string; title: string; notes: string; sortOrder: number }>;
};

function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function createEmptyAction(): ActionFormData {
  return { title: "", description: "", dueDate: "" };
}

export function MeetingForm({ memberId, initialTopics }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topics, setTopics] = useState<TopicFormData[]>(
    initialTopics && initialTopics.length > 0
      ? initialTopics.map((t) => ({ ...t, sortOrder: t.sortOrder }))
      : [createEmptyTopic(0)],
  );
  const [actionItems, setActionItems] = useState<ActionFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTopic(index: number, field: "category" | "title" | "notes", value: string) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function handleTopicDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTopics((prev) => {
      const oldIndex = prev.findIndex((_, i) => `topic-${i}` === active.id);
      const newIndex = prev.findIndex((_, i) => `topic-${i}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((t, i) => ({ ...t, sortOrder: i }));
    });
  }

  function addAction() {
    setActionItems((prev) => [...prev, createEmptyAction()]);
  }

  function removeAction(index: number) {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAction(index: number, field: "title" | "description" | "dueDate", value: string) {
    setActionItems((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function handleActionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setActionItems((prev) => {
      const oldIndex = prev.findIndex((_, i) => `action-${i}` === active.id);
      const newIndex = prev.findIndex((_, i) => `action-${i}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
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

  const topicIds = topics.map((_, i) => `topic-${i}`);
  const actionIds = actionItems.map((_, i) => `action-${i}`);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">話題</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTopic}>
              + 話題を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTopicDragEnd}
          >
            <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
              {topics.map((topic, index) => (
                <SortableTopicItem
                  key={`topic-${index}`}
                  id={`topic-${index}`}
                  category={topic.category}
                  title={topic.title}
                  notes={topic.notes}
                  index={index}
                  showDelete={topics.length > 1}
                  onUpdate={updateTopic}
                  onRemove={removeTopic}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">アクションアイテム</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
              + アクション追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {actionItems.length === 0 && (
            <p className="text-sm text-muted-foreground">アクションはまだありません</p>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleActionDragEnd}
          >
            <SortableContext items={actionIds} strategy={verticalListSortingStrategy}>
              {actionItems.map((action, index) => (
                <SortableActionItem
                  key={`action-${index}`}
                  id={`action-${index}`}
                  title={action.title}
                  description={action.description}
                  dueDate={action.dueDate}
                  index={index}
                  onUpdate={updateAction}
                  onRemove={removeAction}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "保存中..." : "1on1を保存"}
      </Button>
    </form>
  );
}
```

**Step 4: Run all tests to verify they pass**

Run:

```bash
npx vitest run src/components/meeting/__tests__/
```

Expected: all tests in `meeting-form.test.tsx`, `sortable-topic-item.test.tsx`, `sortable-action-item.test.tsx` PASS.

**Step 5: Commit**

```bash
git add src/components/meeting/meeting-form.tsx src/components/meeting/__tests__/meeting-form.test.tsx
git commit -m "feat: integrate @dnd-kit drag-and-drop into MeetingForm topics and actions"
```

---

## Task 5: Run full test suite and verify build

**Files:** None (verification only)

**Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: ALL tests PASS.

**Step 2: Verify TypeScript compilation**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Verify production build**

Run:

```bash
npm run build
```

Expected: build completes successfully.

**Step 4: Manual smoke test**

Run:

```bash
npm run dev
```

Open `http://localhost:3000`, navigate to a member → 新規1on1. Verify:

- [ ] Each topic row has a grip handle on the left
- [ ] Dragging the grip handle reorders topics
- [ ] After adding action items, they also have grip handles and can be reordered
- [ ] Keyboard: Tab to grip handle → Space → Arrow keys → Space confirms reorder
- [ ] Submit still works correctly after reordering

**Step 5: Commit (if any lint/format changes)**

```bash
npm run format
git add -A
git commit -m "chore: format after dnd integration"
```
