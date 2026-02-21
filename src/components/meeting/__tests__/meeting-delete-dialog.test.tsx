import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { MeetingDeleteDialog } from "../meeting-delete-dialog";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

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

const mockDeleteMeeting = vi.fn();

vi.mock("@/lib/actions/meeting-actions", () => ({
  deleteMeeting: (...args: unknown[]) => mockDeleteMeeting(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const props = {
  meetingId: "meeting-1",
  memberId: "member-1",
  meetingDate: "2025年1月15日",
};

describe("MeetingDeleteDialog", () => {
  it("「削除」ボタンが表示される", () => {
    render(<MeetingDeleteDialog {...props} />);
    expect(screen.getByRole("button", { name: /削除/ })).toBeDefined();
  });

  it("ボタンクリックで確認ダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<MeetingDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));

    expect(screen.getByText("ミーティングを削除しますか？")).toBeDefined();
    expect(
      screen.getByText(
        "2025年1月15日のミーティング記録を削除します。関連する話題とアクションアイテムもすべて削除されます。この操作は取り消せません。",
      ),
    ).toBeDefined();
  });

  it("キャンセルボタンでダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<MeetingDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(mockDeleteMeeting).not.toHaveBeenCalled();
  });

  it("削除成功後にメンバー詳細ページへ遷移する", async () => {
    const user = userEvent.setup();
    mockDeleteMeeting.mockResolvedValue({ success: true, data: {} });
    render(<MeetingDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(mockDeleteMeeting).toHaveBeenCalledWith("meeting-1");
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.deleteSuccess);
    expect(mockPush).toHaveBeenCalledWith("/members/member-1");
  });

  it("削除失敗時にエラーメッセージとトーストが表示される", async () => {
    const user = userEvent.setup();
    mockDeleteMeeting.mockResolvedValue({ success: false, error: "削除エラー" });
    render(<MeetingDeleteDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /削除/ }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(screen.getByText("削除エラー")).toBeDefined();
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.deleteError);
    });
  });
});
