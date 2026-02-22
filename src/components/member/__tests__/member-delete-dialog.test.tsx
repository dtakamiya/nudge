import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { MemberDeleteDialog } from "../member-delete-dialog";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDeleteMember = vi.fn();

vi.mock("@/lib/actions/member-actions", () => ({
  deleteMember: (...args: unknown[]) => mockDeleteMember(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const props = {
  memberId: "member-1",
  memberName: "田中太郎",
};

describe("MemberDeleteDialog", () => {
  it("「削除」ボタンが表示される", () => {
    render(<MemberDeleteDialog {...props} />);
    expect(screen.getByRole("button", { name: /削除/ })).toBeDefined();
  });

  it("ボタンクリックで確認ダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<MemberDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));

    expect(screen.getByText("メンバーを削除しますか？")).toBeDefined();
    expect(
      screen.getByText(
        "田中太郎のデータを削除します。関連するミーティング記録やアクションアイテムもすべて削除されます。この操作は取り消せません。",
      ),
    ).toBeDefined();
  });

  it("キャンセルボタンでダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<MemberDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(mockDeleteMember).not.toHaveBeenCalled();
  });

  it("削除成功後にダッシュボードへ遷移する", async () => {
    const user = userEvent.setup();
    mockDeleteMember.mockResolvedValue({ success: true, data: {} });
    render(<MemberDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(mockDeleteMember).toHaveBeenCalledWith("member-1");
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.member.deleteSuccess);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("削除失敗時にエラーメッセージとトーストが表示される", async () => {
    const user = userEvent.setup();
    mockDeleteMember.mockResolvedValue({ success: false, error: "削除エラー" });
    render(<MemberDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(screen.getByText("削除エラー")).toBeDefined();
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.member.deleteError);
    });
  });
});
