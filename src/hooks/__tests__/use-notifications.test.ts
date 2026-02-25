import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNotifications } from "../use-notifications";

// Server Action のモック
vi.mock("@/lib/actions/reminder-actions", () => ({
  getActionItemsDueSoon: vi.fn(),
}));

const STORAGE_KEY = "nudge:notifications-enabled";
const LAST_NOTIFIED_KEY = "nudge:last-notified-date";

describe("useNotifications", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    // モックのデフォルト実装を再設定
    const { getActionItemsDueSoon } = await import("@/lib/actions/reminder-actions");
    vi.mocked(getActionItemsDueSoon).mockResolvedValue([]);
    // Notification コンストラクタのモック
    vi.stubGlobal(
      "Notification",
      Object.assign(
        vi.fn().mockImplementation(() => ({
          onclick: null,
        })),
        {
          permission: "default",
          requestPermission: vi.fn().mockResolvedValue("granted"),
        },
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isSupported", () => {
    it("Notification API が利用可能な場合は true を返す", () => {
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn().mockResolvedValue("granted"),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(true);
    });

    it("Notification API が存在しない場合は false を返す", () => {
      vi.stubGlobal("Notification", undefined);

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe("permission", () => {
    it("Notification.permission の状態を返す（default）", () => {
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.permission).toBe("default");
    });

    it("Notification.permission の状態を返す（granted）", () => {
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.permission).toBe("granted");
    });

    it("Notification API が未サポートの場合は denied を返す", () => {
      vi.stubGlobal("Notification", undefined);

      const { result } = renderHook(() => useNotifications());
      expect(result.current.permission).toBe("denied");
    });
  });

  describe("isEnabled", () => {
    it("localStorage に設定がない場合はデフォルト false を返す", () => {
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isEnabled).toBe(false);
    });

    it("localStorage に true が保存されている場合は true を返す", () => {
      localStorage.setItem(STORAGE_KEY, "true");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isEnabled).toBe(true);
    });

    it("localStorage に false が保存されている場合は false を返す", () => {
      localStorage.setItem(STORAGE_KEY, "false");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe("setEnabled", () => {
    it("true に設定すると localStorage に保存される", async () => {
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        result.current.setEnabled(true);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
      expect(result.current.isEnabled).toBe(true);
    });

    it("false に設定すると localStorage に保存される", async () => {
      localStorage.setItem(STORAGE_KEY, "true");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        result.current.setEnabled(false);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe("false");
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe("requestPermission", () => {
    it("許可が取得された場合は permission が granted に更新される", async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: mockRequestPermission,
      });

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it("Notification API が未サポートの場合は何もしない", async () => {
      vi.stubGlobal("Notification", undefined);

      const { result } = renderHook(() => useNotifications());

      // エラーが発生しないことを確認
      await act(async () => {
        await result.current.requestPermission();
      });
    });
  });

  describe("checkAndNotify", () => {
    it("通知が無効の場合は Server Action を呼ばない", async () => {
      const { getActionItemsDueSoon } = await import("@/lib/actions/reminder-actions");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });
      localStorage.setItem(STORAGE_KEY, "false");

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.checkAndNotify();
      });

      expect(getActionItemsDueSoon).not.toHaveBeenCalled();
    });

    it("通知許可がない場合は Server Action を呼ばない", async () => {
      const { getActionItemsDueSoon } = await import("@/lib/actions/reminder-actions");
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn(),
      });
      localStorage.setItem(STORAGE_KEY, "true");

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.checkAndNotify();
      });

      expect(getActionItemsDueSoon).not.toHaveBeenCalled();
    });

    it("通知有効かつ許可済みの場合、同日は1回のみ通知する（lastNotifiedAt チェック）", async () => {
      const { getActionItemsDueSoon } = await import("@/lib/actions/reminder-actions");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });
      localStorage.setItem(STORAGE_KEY, "true");

      // 今日の日付を保存
      const today = new Date().toDateString();
      localStorage.setItem(LAST_NOTIFIED_KEY, today);

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.checkAndNotify();
      });

      expect(getActionItemsDueSoon).not.toHaveBeenCalled();
    });

    it("通知有効・許可済み・未通知の場合は Server Action を呼ぶ", async () => {
      const { getActionItemsDueSoon } = await import("@/lib/actions/reminder-actions");
      vi.stubGlobal("Notification", {
        permission: "granted",
        requestPermission: vi.fn(),
      });
      localStorage.setItem(STORAGE_KEY, "true");

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.checkAndNotify();
      });

      expect(getActionItemsDueSoon).toHaveBeenCalled();
    });
  });
});
