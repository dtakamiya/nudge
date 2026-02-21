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
    expect(screen.getByTestId("drag-handle-topic-0")).toBeTruthy();
    expect(screen.getByTestId("drag-handle-topic-1")).toBeTruthy();
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
    expect(screen.getByTestId("drag-handle-action-0")).toBeTruthy();
  });
});
