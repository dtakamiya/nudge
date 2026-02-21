import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionItemEditDialog } from "../action-item-edit-dialog";

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

const mockUpdateActionItem = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItem: (...args: unknown[]) => mockUpdateActionItem(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const actionItem = {
  id: "action-1",
  title: "タスクA",
  description: "説明文",
  status: "TODO" as const,
  dueDate: new Date("2025-06-01"),
};

describe("ActionItemEditDialog", () => {
  it("編集ボタンが表示される", () => {
    render(<ActionItemEditDialog actionItem={actionItem} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeDefined();
  });

  it("ボタンクリックでダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<ActionItemEditDialog actionItem={actionItem} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));

    expect(screen.getByText("アクションアイテムの編集")).toBeDefined();
  });

  it("ダイアログ内に初期値が表示される", async () => {
    const user = userEvent.setup();
    render(<ActionItemEditDialog actionItem={actionItem} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));

    const titleInput = screen.getByLabelText("タイトル *") as HTMLInputElement;
    expect(titleInput.value).toBe("タスクA");
  });

  it("更新成功後にダイアログが閉じ、router.refresh が呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionItemEditDialog actionItem={actionItem} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateActionItem).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
