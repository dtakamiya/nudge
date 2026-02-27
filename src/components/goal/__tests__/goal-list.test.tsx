import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { GoalWithActionItems } from "@/lib/actions/goal-actions";

import { GoalList } from "../goal-list";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/goal-actions", () => ({
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
  updateGoalProgress: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const memberId = "member-1";

const mockGoals: GoalWithActionItems[] = [
  {
    id: "goal-1",
    memberId,
    title: "TypeScript習得",
    description: "型システムを理解する",
    progress: 30,
    status: "IN_PROGRESS",
    progressMode: "MANUAL",
    dueDate: new Date("2026-06-01"),
    createdAt: new Date(),
    updatedAt: new Date(),
    actionItems: [],
  },
  {
    id: "goal-2",
    memberId,
    title: "完了した目標",
    description: "",
    progress: 100,
    status: "COMPLETED",
    progressMode: "MANUAL",
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    actionItems: [],
  },
];

describe("GoalList", () => {
  it("目標一覧を表示する", () => {
    render(<GoalList goals={mockGoals} memberId={memberId} />);
    expect(screen.getByText("TypeScript習得")).toBeDefined();
    expect(screen.getByText("完了した目標")).toBeDefined();
  });

  it("空の場合はEmptyStateを表示する", () => {
    render(<GoalList goals={[]} memberId={memberId} />);
    expect(screen.getByText("目標がありません")).toBeDefined();
  });

  it("目標を追加ボタンが表示される", () => {
    render(<GoalList goals={[]} memberId={memberId} />);
    expect(screen.getByText("目標を追加")).toBeDefined();
  });

  it("フィルタボタンが表示される", () => {
    render(<GoalList goals={mockGoals} memberId={memberId} />);
    const buttons = screen.getAllByRole("button");
    const filterLabels = ["すべて", "進行中", "完了", "キャンセル"];
    for (const label of filterLabels) {
      expect(buttons.some((btn) => btn.textContent === label)).toBe(true);
    }
  });

  it("進行中フィルタで進行中の目標のみ表示される", async () => {
    const user = userEvent.setup();
    render(<GoalList goals={mockGoals} memberId={memberId} />);

    const filterButtons = screen.getAllByRole("button");
    const inProgressBtn = filterButtons.find((btn) => btn.textContent === "進行中");
    expect(inProgressBtn).toBeDefined();
    await user.click(inProgressBtn!);

    expect(screen.getByText("TypeScript習得")).toBeDefined();
    expect(screen.queryByText("完了した目標")).toBeNull();
  });

  it("完了フィルタで完了した目標のみ表示される", async () => {
    const user = userEvent.setup();
    render(<GoalList goals={mockGoals} memberId={memberId} />);

    const filterButtons = screen.getAllByRole("button");
    const completedBtn = filterButtons.find((btn) => btn.textContent === "完了");
    await user.click(completedBtn!);

    expect(screen.queryByText("TypeScript習得")).toBeNull();
    expect(screen.getByText("完了した目標")).toBeDefined();
  });
});
