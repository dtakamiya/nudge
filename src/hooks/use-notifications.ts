"use client";

import { useCallback, useState } from "react";

import { getActionItemsDueSoon } from "@/lib/actions/reminder-actions";

const STORAGE_KEY = "nudge:notifications-enabled";
const LAST_NOTIFIED_KEY = "nudge:last-notified-date";

type NotificationPermission = "default" | "denied" | "granted";

type UseNotificationsReturn = {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  setEnabled: (value: boolean) => void;
  requestPermission: () => Promise<void>;
  checkAndNotify: () => Promise<void>;
};

function readEnabledFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function isNotifiedToday(): boolean {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY) === new Date().toDateString();
  } catch {
    return false;
  }
}

function markNotifiedToday(): void {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, new Date().toDateString());
  } catch {
    // localStorage が使えない環境では何もしない
  }
}

function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !window.Notification) return "denied";
  return window.Notification.permission as NotificationPermission;
}

export function useNotifications(): UseNotificationsReturn {
  const isSupported =
    typeof window !== "undefined" &&
    typeof window.Notification !== "undefined" &&
    window.Notification !== null;

  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission(),
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(() => readEnabledFromStorage());

  const setEnabled = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // localStorage が使えない環境では状態のみ更新
    }
    setIsEnabled(value);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported || !window.Notification) return;
    const result = await window.Notification.requestPermission();
    setPermission(result as NotificationPermission);
  }, [isSupported]);

  const checkAndNotify = useCallback(async () => {
    if (!isEnabled || permission !== "granted") return;
    if (isNotifiedToday()) return;

    const items = await getActionItemsDueSoon();
    markNotifiedToday();

    if (items.length === 0) return;

    const overdueCount = items.filter((item) => item.isOverdue).length;
    const dueTodayCount = items.filter((item) => !item.isOverdue).length;

    const lines: string[] = [];
    if (overdueCount > 0) lines.push(`期限切れ: ${overdueCount}件`);
    if (dueTodayCount > 0) lines.push(`期限間近: ${dueTodayCount}件`);

    const notification = new window.Notification("Nudge - アクションアイテムの期限", {
      body: lines.join("\n"),
      icon: "/favicon.ico",
      tag: "nudge-action-reminder",
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/actions";
    };
  }, [isEnabled, permission]);

  return {
    isSupported,
    permission,
    isEnabled,
    setEnabled,
    requestPermission,
    checkAndNotify,
  };
}
