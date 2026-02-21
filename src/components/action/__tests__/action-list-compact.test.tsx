import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ActionListCompact } from "../action-list-compact";
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
  updateActionItem: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseItems = [
  {
    id: "action-1",
    title: "テストタスク1",
    description: "",
    status: "TODO",
    dueDate: new Date("2026-03-01"),
    meeting: { date: new Date("2026-02-15") },
  },
  {
    id: "action-2",
    title: "テストタスク2",
    description: "",
    status: "IN_PROGRESS",
    dueDate: null,
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("ActionListCompact", () => {
  it("空リストのときメッセージを表示する", () => {
    render(<ActionListCompact actionItems={[]} />);
    expect(screen.getByText("アクションアイテムはありません")).toBeDefined();
  });

  it("アクションアイテムのタイトルを表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText("テストタスク1")).toBeDefined();
    expect(screen.getByText("テストタスク2")).toBeDefined();
  });

  it("ステータスバッジを表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText("未着手")).toBeDefined();
    expect(screen.getByText("進行中")).toBeDefined();
  });

  it("期限日を表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText(/期限:/)).toBeDefined();
  });

  it("ステータスクリックで楽観的にUIが更新される", async () => {
    const user = userEvent.setup();
    // サーバーの応答を遅延させる
    mockUpdateActionItemStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100)),
    );

    render(<ActionListCompact actionItems={baseItems} />);

    // TODO → IN_PROGRESS に遷移
    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    // 楽観的更新により即座に「進行中」に変わる
    const progressBadges = screen.getAllByText("進行中");
    expect(progressBadges.length).toBe(2);
  });

  it("ステータス変更でサーバーアクションが呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: true, data: {} });

    render(<ActionListCompact actionItems={baseItems} />);

    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    expect(mockUpdateActionItemStatus).toHaveBeenCalledWith("action-1", "IN_PROGRESS");
  });

  it("IN_PROGRESS → DONE に遷移する", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: true, data: {} });

    render(<ActionListCompact actionItems={baseItems} />);

    const progressButton = screen.getByText("進行中").closest("button")!;
    await user.click(progressButton);

    expect(mockUpdateActionItemStatus).toHaveBeenCalledWith("action-2", "DONE");
  });

  it("サーバーエラー時にエラートーストが表示され router.refresh でロールバックする", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: false, error: "Server error" });

    render(<ActionListCompact actionItems={baseItems} />);

    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.statusChangeError);
    expect(mockRefresh).toHaveBeenCalled();
  });
});
