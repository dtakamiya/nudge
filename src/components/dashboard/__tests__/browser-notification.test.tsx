import { act,cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach,describe, expect, it, vi } from "vitest";

import type { OverdueReminder } from "@/lib/actions/reminder-actions";

import { BrowserNotification } from "../browser-notification";

const makeReminder = (overrides: Partial<OverdueReminder> = {}): OverdueReminder => ({
  memberId: "member-1",
  memberName: "テストメンバー",
  meetingIntervalDays: 14,
  daysSinceLastMeeting: 20,
  ...overrides,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

describe("BrowserNotification", () => {
  describe("Notification API 非対応環境", () => {
    beforeEach(() => {
      vi.stubGlobal("Notification", undefined);
    });

    it("Notification API が未対応でもクラッシュしない", () => {
      expect(() => {
        render(<BrowserNotification reminders={[makeReminder()]} />);
      }).not.toThrow();
    });
  });

  describe("Notification API 対応環境 - 許可未設定", () => {
    const mockRequestPermission = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockNotification: any = vi.fn();

    beforeEach(() => {
      Object.defineProperty(MockNotification, "permission", {
        get: () => "default",
        configurable: true,
      });
      MockNotification.requestPermission = mockRequestPermission.mockResolvedValue("granted");
      vi.stubGlobal("Notification", MockNotification);
    });

    it("リマインダーがある場合に requestPermission を呼ぶ", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[makeReminder()]} />);
      });
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it("リマインダーが空の場合は requestPermission を呼ばない", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[]} />);
      });
      expect(mockRequestPermission).not.toHaveBeenCalled();
    });
  });

  describe("Notification API 対応環境 - 通知拒否", () => {
    const mockNotificationConstructor = vi.fn();

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockNotification: any = vi.fn().mockImplementation(mockNotificationConstructor);
      Object.defineProperty(MockNotification, "permission", {
        get: () => "denied",
        configurable: true,
      });
      MockNotification.requestPermission = vi.fn().mockResolvedValue("denied");
      vi.stubGlobal("Notification", MockNotification);
    });

    it("通知が拒否されている場合は Notification を生成しない", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[makeReminder()]} />);
      });
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
  });

  describe("今日通知済みの場合", () => {
    const mockNotificationConstructor = vi.fn();

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockNotification: any = vi.fn().mockImplementation(mockNotificationConstructor);
      Object.defineProperty(MockNotification, "permission", {
        get: () => "granted",
        configurable: true,
      });
      MockNotification.requestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", MockNotification);

      // 今日通知済みフラグをセット
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("nudge_notification_date", today);
    });

    it("今日すでに通知済みの場合は Notification を生成しない", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[makeReminder()]} />);
      });
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
  });

  describe("許可済み・未通知の場合", () => {
    const mockNotificationConstructor = vi.fn();

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockNotification: any = vi.fn().mockImplementation(mockNotificationConstructor);
      Object.defineProperty(MockNotification, "permission", {
        get: () => "granted",
        configurable: true,
      });
      MockNotification.requestPermission = vi.fn().mockResolvedValue("granted");
      vi.stubGlobal("Notification", MockNotification);
    });

    it("許可済みでリマインダーがある場合は Notification を生成する", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[makeReminder({ memberName: "田中太郎" })]} />);
      });
      expect(mockNotificationConstructor).toHaveBeenCalled();
    });

    it("通知後に今日の日付を localStorage に保存する", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[makeReminder()]} />);
      });
      const today = new Date().toISOString().split("T")[0];
      expect(localStorage.getItem("nudge_notification_date")).toBe(today);
    });

    it("リマインダーが空の場合は Notification を生成しない", async () => {
      await act(async () => {
        render(<BrowserNotification reminders={[]} />);
      });
      expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
  });
});
