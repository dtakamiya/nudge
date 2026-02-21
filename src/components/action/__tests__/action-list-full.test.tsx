import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ActionListFull } from "../action-list-full";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUpdateActionItemStatus = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: (...args: unknown[]) => mockUpdateActionItemStatus(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseItems = [
  {
    id: "action-1",
    title: "レビュー依頼",
    description: "PRのレビューをする",
    status: "TODO",
    dueDate: new Date("2026-03-01"),
    member: { id: "member-1", name: "田中太郎" },
    meeting: { id: "meeting-1", date: new Date("2026-02-15") },
  },
  {
    id: "action-2",
    title: "ドキュメント更新",
    description: "",
    status: "IN_PROGRESS",
    dueDate: null,
    member: { id: "member-2", name: "佐藤花子" },
    meeting: { id: "meeting-2", date: new Date("2026-02-10") },
  },
];

describe("ActionListFull", () => {
  it("空リストのときメッセージを表示する", () => {
    render(<ActionListFull actionItems={[]} />);
    expect(screen.getByText("アクションアイテムはありません")).toBeDefined();
  });

  it("アクションアイテムのタイトルとメンバー名を表示する", () => {
    render(<ActionListFull actionItems={baseItems} />);
    expect(screen.getByText("レビュー依頼")).toBeDefined();
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("ドキュメント更新")).toBeDefined();
    expect(screen.getByText("佐藤花子")).toBeDefined();
  });

  it("期限日を表示する", () => {
    render(<ActionListFull actionItems={baseItems} />);
    expect(screen.getByText(/期限:/)).toBeDefined();
  });

  it("ステータスセレクトが表示される", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(2);
  });

  it("メンバーへのリンクが正しい", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const link = screen.getByText("田中太郎");
    expect(link.closest("a")?.getAttribute("href")).toBe("/members/member-1");
  });

  // Note: Radix UI Select の onValueChange テストは jsdom 環境では
  // hasPointerCapture 非対応のため実行不可。
  // トースト通知のロジックは action-list-compact テストで検証している。
});
