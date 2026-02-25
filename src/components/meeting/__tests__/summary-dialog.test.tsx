import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SummaryDialog } from "../summary-dialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Clipboard API mock
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// URL.createObjectURL / revokeObjectURL mock
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
Object.assign(URL, {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseData = {
  memberName: "田中太郎",
  date: new Date("2026-02-20T10:00:00.000Z"),
  conditionHealth: 4 as number | null,
  conditionMood: 3 as number | null,
  conditionWorkload: 2 as number | null,
  checkinNote: "少し疲れ気味です" as string | null,
  topics: [{ category: "WORK_PROGRESS", title: "スプリントレビュー", notes: "進捗は良好" }],
  actionItems: [
    {
      title: "バグ修正",
      description: "ログインバグ修正",
      status: "TODO",
      dueDate: new Date("2026-03-01"),
    },
  ],
  startedAt: new Date("2026-02-20T10:00:00.000Z") as Date | null,
  endedAt: new Date("2026-02-20T10:45:00.000Z") as Date | null,
};

describe("SummaryDialog", () => {
  it("open=true でダイアログが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.getByText("ミーティングサマリー")).toBeDefined();
  });

  it("open=false でダイアログが非表示", () => {
    render(<SummaryDialog open={false} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.queryByText("ミーティングサマリー")).toBeNull();
  });

  it("サマリープレビューが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("デフォルトで Markdown 形式のサマリーが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.textContent || (textarea as HTMLTextAreaElement).value).toContain(
      "# 1on1サマリー",
    );
  });

  it("フォーマット切替ボタンが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.getByRole("button", { name: /Markdown/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /テキスト/ })).toBeDefined();
  });

  it("テキストボタンクリックでプレーンテキスト形式に切り替わる", async () => {
    const user = userEvent.setup();
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);

    await user.click(screen.getByRole("button", { name: /テキスト/ }));

    const textarea = screen.getByRole("textbox");
    expect(textarea.textContent || (textarea as HTMLTextAreaElement).value).toContain(
      "【1on1サマリー】",
    );
  });

  it("クリップボードにコピーボタンが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.getByRole("button", { name: /コピー/ })).toBeDefined();
  });

  it("ダウンロードボタンが表示される", () => {
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);
    expect(screen.getByRole("button", { name: /ダウンロード/ })).toBeDefined();
  });

  it("コピーボタンクリックでコピー成功トーストが表示される", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);

    await user.click(screen.getByRole("button", { name: /コピー/ }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("サマリーをクリップボードにコピーしました");
    });
  });

  it("ダウンロードボタンクリックで Blob が生成される", async () => {
    const user = userEvent.setup();
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);

    await user.click(screen.getByRole("button", { name: /ダウンロード/ }));

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  it("ダウンロード成功後にトースト通知が表示される", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);

    await user.click(screen.getByRole("button", { name: /ダウンロード/ }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("サマリーをダウンロードしました");
    });
  });

  it("テキスト形式でダウンロードすると .txt 拡張子になる", async () => {
    const user = userEvent.setup();
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    render(<SummaryDialog open={true} onOpenChange={vi.fn()} data={baseData} />);

    await user.click(screen.getByRole("button", { name: /テキスト/ }));
    await user.click(screen.getByRole("button", { name: /ダウンロード/ }));

    await waitFor(() => {
      const anchor = appendChildSpy.mock.calls.find(
        (call) => (call[0] as HTMLElement).tagName === "A",
      );
      expect(anchor).toBeDefined();
      const a = anchor![0] as HTMLAnchorElement;
      expect(a.download).toContain(".txt");
    });

    appendChildSpy.mockRestore();
  });
});
