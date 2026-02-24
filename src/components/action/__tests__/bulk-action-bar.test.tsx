import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { BulkActionBar } from "../bulk-action-bar";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBulkUpdateStatus = vi.fn();
const mockBulkDelete = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  bulkUpdateActionItemStatus: (...args: unknown[]) => mockBulkUpdateStatus(...args),
  bulkDeleteActionItems: (...args: unknown[]) => mockBulkDelete(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BulkActionBar", () => {
  it("selectedIds が空の場合は何も表示しない", () => {
    const { container } = render(<BulkActionBar selectedIds={new Set()} onClearAll={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("選択件数を表示する", () => {
    render(<BulkActionBar selectedIds={new Set(["id-1", "id-2"])} onClearAll={vi.fn()} />);
    expect(screen.getByText("2件選択中")).toBeDefined();
  });

  it("ステータス変更ボタンが表示される", () => {
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={vi.fn()} />);
    expect(screen.getByRole("button", { name: /未着手/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /進行中/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /完了/ })).toBeDefined();
  });

  it("削除ボタンが表示される", () => {
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={vi.fn()} />);
    expect(screen.getByRole("button", { name: /削除/ })).toBeDefined();
  });

  it("選択解除ボタンが表示される", () => {
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={vi.fn()} />);
    expect(screen.getByRole("button", { name: /選択を解除/ })).toBeDefined();
  });

  it("選択解除ボタンクリックで onClearAll が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={onClearAll} />);
    await user.click(screen.getByRole("button", { name: /選択を解除/ }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it("完了ボタンクリックで bulkUpdateActionItemStatus が DONE で呼ばれる", async () => {
    const user = userEvent.setup();
    mockBulkUpdateStatus.mockResolvedValue({ success: true, data: { count: 2 } });
    const onClearAll = vi.fn();
    render(<BulkActionBar selectedIds={new Set(["id-1", "id-2"])} onClearAll={onClearAll} />);
    await user.click(screen.getByRole("button", { name: /完了/ }));
    expect(mockBulkUpdateStatus).toHaveBeenCalledWith(
      expect.arrayContaining(["id-1", "id-2"]),
      "DONE",
    );
  });

  it("ステータス変更成功時にトーストと clearAll が呼ばれる", async () => {
    const user = userEvent.setup();
    mockBulkUpdateStatus.mockResolvedValue({ success: true, data: { count: 1 } });
    const onClearAll = vi.fn();
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={onClearAll} />);
    await user.click(screen.getByRole("button", { name: /完了/ }));
    expect(toast.success).toHaveBeenCalledWith(
      TOAST_MESSAGES.actionItem.bulkStatusChangeSuccess(1),
    );
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it("ステータス変更失敗時にエラートーストが表示される", async () => {
    const user = userEvent.setup();
    mockBulkUpdateStatus.mockResolvedValue({ success: false, error: "Error" });
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /未着手/ }));
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.bulkStatusChangeError);
  });

  it("削除ボタンクリックで確認ダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<BulkActionBar selectedIds={new Set(["id-1"])} onClearAll={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /削除/ }));
    expect(screen.getByText(/この操作は取り消せません/)).toBeDefined();
  });
});
