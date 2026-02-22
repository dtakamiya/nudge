import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportDialog } from "../export-dialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockGetMeetingsForExport = vi.fn();
vi.mock("@/lib/actions/export-actions", () => ({
  getMeetingsForExport: (...args: unknown[]) => mockGetMeetingsForExport(...args),
}));

vi.mock("@/lib/export", () => ({
  formatMeetingMarkdown: vi.fn(() => "# 1on1 サマリー - テスト太郎\n\n内容"),
}));

// Clipboard API mock
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const props = {
  memberId: "member-1",
  memberName: "テスト太郎",
};

const mockExportResult = {
  success: true as const,
  data: {
    member: { id: "member-1", name: "テスト太郎", department: "開発部", position: null },
    meetings: [],
  },
};

describe("ExportDialog", () => {
  it("「エクスポート」ボタンが表示される", () => {
    render(<ExportDialog {...props} />);
    expect(screen.getByRole("button", { name: /エクスポート/ })).toBeDefined();
  });

  it("ボタンクリックでダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));

    expect(screen.getByText("ミーティングノートをエクスポート")).toBeDefined();
  });

  it("ダイアログ内にメンバー名が表示される", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));

    expect(screen.getByText(/テスト太郎/)).toBeDefined();
  });

  it("期間入力フィールドが表示される", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));

    expect(screen.getByLabelText("開始日")).toBeDefined();
    expect(screen.getByLabelText("終了日")).toBeDefined();
  });

  it("クリップボードにコピーボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));

    expect(screen.getByRole("button", { name: /クリップボードにコピー/ })).toBeDefined();
  });

  it("Markdownをダウンロードするボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));

    expect(screen.getByRole("button", { name: /Markdownでダウンロード/ })).toBeDefined();
  });

  it("コピーボタンクリックで getMeetingsForExport が呼ばれる", async () => {
    mockGetMeetingsForExport.mockResolvedValue(mockExportResult);
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));
    await user.click(screen.getByRole("button", { name: /クリップボードにコピー/ }));

    await waitFor(() => {
      expect(mockGetMeetingsForExport).toHaveBeenCalledWith(
        expect.objectContaining({ memberId: "member-1" }),
      );
    });
  });

  it("コピー成功後に成功トーストが表示される", async () => {
    mockGetMeetingsForExport.mockResolvedValue(mockExportResult);
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));
    await user.click(screen.getByRole("button", { name: /クリップボードにコピー/ }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("クリップボードにコピーしました");
    });
  });

  it("取得失敗時にエラートーストが表示される", async () => {
    mockGetMeetingsForExport.mockResolvedValue({ success: false, error: "取得エラー" });
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));
    await user.click(screen.getByRole("button", { name: /クリップボードにコピー/ }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("エクスポートに失敗しました");
    });
  });

  it("キャンセルボタンでダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<ExportDialog {...props} />);

    await user.click(screen.getByRole("button", { name: /エクスポート/ }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    await waitFor(() => {
      expect(screen.queryByText("ミーティングノートをエクスポート")).toBeNull();
    });
  });
});
