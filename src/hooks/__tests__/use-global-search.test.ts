import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGlobalSearch } from "../use-global-search";

// next/navigation のモック
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// searchAll のモック
const mockSearchAll = vi.fn();
vi.mock("@/lib/actions/search-actions", () => ({
  searchAll: (...args: unknown[]) => mockSearchAll(...args),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const mockResults = {
  members: [{ id: "m1", name: "田中太郎", department: "開発部", position: null }],
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
  actionItems: [
    {
      id: "a1",
      title: "資料作成",
      description: null,
      status: "TODO",
      memberId: "m1",
      memberName: "田中太郎",
      meetingId: "meeting-1",
    },
  ],
  tags: [{ id: "tag1", name: "重要", color: "#ef4444" }],
};

describe("useGlobalSearch", () => {
  describe("初期状態", () => {
    it("初期値が正しい", () => {
      const { result } = renderHook(() => useGlobalSearch());
      expect(result.current.query).toBe("");
      expect(result.current.results).toBeNull();
      expect(result.current.isOpen).toBe(false);
      expect(result.current.activeIndex).toBe(-1);
    });
  });

  describe("handleQueryChange", () => {
    beforeEach(() => {
      mockSearchAll.mockResolvedValue({ success: true, data: mockResults });
    });

    it("2文字以上でsearchAllが呼ばれる", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田中");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(mockSearchAll).toHaveBeenCalledWith("田中");
      });
      vi.useRealTimers();
    });

    it("1文字ではsearchAllが呼ばれない", async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockSearchAll).not.toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("空文字でcloseDropdownされる", () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("");
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("allItems", () => {
    it("results から正しいフラットリストを生成する", async () => {
      vi.useFakeTimers();
      mockSearchAll.mockResolvedValue({ success: true, data: mockResults });
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田中");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.allItems).toHaveLength(4);
      });
      expect(result.current.allItems[0].id).toBe("search-member-m1");
      expect(result.current.allItems[1].id).toBe("search-topic-t1");
      expect(result.current.allItems[2].id).toBe("search-action-a1");
      expect(result.current.allItems[3].id).toBe("search-tag-tag1");
      vi.useRealTimers();
    });
  });

  describe("handleNavigate", () => {
    it("router.pushを呼び出してドロップダウンを閉じる", async () => {
      vi.useFakeTimers();
      mockSearchAll.mockResolvedValue({ success: true, data: mockResults });
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田中");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true);
      });

      act(() => {
        result.current.handleNavigate("/members/m1");
      });

      expect(mockPush).toHaveBeenCalledWith("/members/m1");
      expect(result.current.isOpen).toBe(false);
      expect(result.current.query).toBe("");
      vi.useRealTimers();
    });
  });

  describe("closeDropdown", () => {
    it("isOpen・results・activeIndexをリセットする", async () => {
      vi.useFakeTimers();
      mockSearchAll.mockResolvedValue({ success: true, data: mockResults });
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田中");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true);
      });

      act(() => {
        result.current.closeDropdown();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.results).toBeNull();
      expect(result.current.activeIndex).toBe(-1);
      vi.useRealTimers();
    });
  });

  describe("hasResults", () => {
    it("結果がある場合true", async () => {
      vi.useFakeTimers();
      mockSearchAll.mockResolvedValue({ success: true, data: mockResults });
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("田中");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.hasResults).toBe(true);
      });
      vi.useRealTimers();
    });

    it("結果が空の場合false", async () => {
      vi.useFakeTimers();
      mockSearchAll.mockResolvedValue({
        success: true,
        data: { members: [], topics: [], actionItems: [], tags: [] },
      });
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.handleQueryChange("存在しない");
      });
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true);
      });
      expect(result.current.hasResults).toBe(false);
      vi.useRealTimers();
    });
  });
});
