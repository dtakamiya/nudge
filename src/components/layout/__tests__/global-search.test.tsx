import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalSearch } from "../global-search";

// next/navigation のモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// searchAll のモック
const mockSearchAll = vi.fn();
vi.mock("@/lib/actions/search-actions", () => ({
  searchAll: (...args: unknown[]) => mockSearchAll(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const emptyResults = {
  success: true as const,
  data: { members: [], topics: [], actionItems: [] },
};

describe("GlobalSearch", () => {
  describe("基本表示", () => {
    it("検索入力フィールドが表示される", () => {
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");
      expect(input).toBeDefined();
    });

    it("初期状態では検索結果が表示されない", () => {
      render(<GlobalSearch />);
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  describe("検索動作", () => {
    beforeEach(() => {
      mockSearchAll.mockResolvedValue(emptyResults);
    });

    it("2文字以上入力すると searchAll が呼ばれる", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "テスト");
      await waitFor(() => {
        expect(mockSearchAll).toHaveBeenCalledWith("テスト");
      });
    });

    it("1文字では searchAll が呼ばれない", async () => {
      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "テ");
      // 短い入力では検索しない
      expect(mockSearchAll).not.toHaveBeenCalled();
    });
  });

  describe("検索結果表示", () => {
    it("メンバー検索結果が表示される", async () => {
      mockSearchAll.mockResolvedValue({
        success: true,
        data: {
          members: [{ id: "m1", name: "田中太郎", department: "開発部", position: null }],
          topics: [],
          actionItems: [],
        },
      });

      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "田中");
      await waitFor(() => {
        expect(screen.getByText("田中太郎")).toBeDefined();
      });
    });

    it("話題検索結果が表示される", async () => {
      mockSearchAll.mockResolvedValue({
        success: true,
        data: {
          members: [],
          topics: [
            {
              id: "t1",
              title: "キャリア相談",
              notes: null,
              category: "CAREER",
              meetingId: "meeting-1",
              memberId: "m1",
              memberName: "田中太郎",
            },
          ],
          actionItems: [],
        },
      });

      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "キャリア");
      await waitFor(() => {
        expect(screen.getByText("キャリア相談")).toBeDefined();
      });
    });

    it("アクションアイテム検索結果が表示される", async () => {
      mockSearchAll.mockResolvedValue({
        success: true,
        data: {
          members: [],
          topics: [],
          actionItems: [
            {
              id: "a1",
              title: "プレゼン資料作成",
              description: null,
              status: "TODO",
              memberId: "m1",
              memberName: "田中太郎",
              meetingId: "meeting-1",
            },
          ],
        },
      });

      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "プレゼン");
      await waitFor(() => {
        expect(screen.getByText("プレゼン資料作成")).toBeDefined();
      });
    });

    it("結果なしの場合「結果が見つかりませんでした」を表示する", async () => {
      mockSearchAll.mockResolvedValue(emptyResults);

      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "存在しない検索");
      await waitFor(() => {
        expect(screen.getByText("結果が見つかりませんでした")).toBeDefined();
      });
    });
  });

  describe("キーボード操作", () => {
    it("Escape キーで検索結果が閉じる", async () => {
      mockSearchAll.mockResolvedValue({
        success: true,
        data: {
          members: [{ id: "m1", name: "田中太郎", department: null, position: null }],
          topics: [],
          actionItems: [],
        },
      });

      const user = userEvent.setup({ delay: null });
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText("検索...");

      await user.type(input, "田中");
      await waitFor(() => expect(screen.getByText("田中太郎")).toBeDefined());

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByText("田中太郎")).toBeNull();
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("検索入力に aria-label が設定されている", () => {
      render(<GlobalSearch />);
      const input = screen.getByLabelText("グローバル検索");
      expect(input).toBeDefined();
    });
  });
});
