import { cleanup,render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { ActionListFull } from "../action-list-full";

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
const mockUpdateActionItem = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: (...args: unknown[]) => mockUpdateActionItemStatus(...args),
  updateActionItem: (...args: unknown[]) => mockUpdateActionItem(...args),
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

  it("編集ボタンが各行に表示される", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    expect(editButtons.length).toBe(2);
  });

  it("編集ボタンクリックで編集フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    expect(screen.getByDisplayValue("レビュー依頼")).toBeDefined();
    expect(screen.getByRole("button", { name: /保存/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeDefined();
  });

  it("キャンセルボタンで編集モードを終了する", async () => {
    const user = userEvent.setup();
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    const cancelBtn = screen.getByRole("button", { name: /キャンセル/ });
    await user.click(cancelBtn);
    expect(screen.queryByDisplayValue("レビュー依頼")).toBeNull();
  });

  it("保存ボタンクリックで updateActionItem が呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue("レビュー依頼");
    await user.clear(titleInput);
    await user.type(titleInput, "更新タイトル");

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(mockUpdateActionItem).toHaveBeenCalledWith(
      "action-1",
      expect.objectContaining({ title: "更新タイトル" }),
    );
  });

  it("保存成功時にトーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateSuccess);
  });

  it("保存失敗時にエラートーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: false, error: "Error" });
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateError);
  });

  // Note: Radix UI Select の onValueChange テストは jsdom 環境では
  // hasPointerCapture 非対応のため実行不可。
  // トースト通知のロジックは action-list-compact テストで検証している。
});
