import { cleanup,render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemberQuickActions } from "../member-quick-actions";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: vi.fn().mockResolvedValue({ success: true }),
  updateActionItem: vi.fn().mockResolvedValue({ success: true }),
}));

const pendingItems = [
  {
    id: "action-1",
    title: "未完了タスク1",
    description: "説明1",
    status: "TODO",
    dueDate: null,
    meeting: { date: new Date("2026-02-01") },
  },
  {
    id: "action-2",
    title: "進行中タスク",
    description: "",
    status: "IN_PROGRESS",
    dueDate: new Date("2026-03-01"),
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("MemberQuickActions", () => {
  it("セクションタイトルを表示する", () => {
    render(<MemberQuickActions pendingActionItems={pendingItems} />);
    expect(screen.getByText("クイックアクション")).toBeDefined();
  });

  it("未完了アクションの件数バッジを表示する", () => {
    render(<MemberQuickActions pendingActionItems={pendingItems} />);
    expect(screen.getByText("2")).toBeDefined();
  });

  it("アクションアイテムのタイトルを表示する", () => {
    render(<MemberQuickActions pendingActionItems={pendingItems} />);
    expect(screen.getByText("未完了タスク1")).toBeDefined();
    expect(screen.getByText("進行中タスク")).toBeDefined();
  });

  it("空リストのときメッセージを表示する", () => {
    render(<MemberQuickActions pendingActionItems={[]} />);
    expect(screen.getByText("未完了のアクションアイテムはありません")).toBeDefined();
  });
});
