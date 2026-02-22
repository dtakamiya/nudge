"use client";

import { useEffect } from "react";

import type { OverdueReminder } from "@/lib/actions/reminder-actions";

const STORAGE_KEY = "nudge_notification_date";

type Props = {
  readonly reminders: OverdueReminder[];
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function hasNotifiedToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === getTodayString();
  } catch {
    return false;
  }
}

function markNotifiedToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getTodayString());
  } catch {
    // localStorage unavailable
  }
}

async function sendBrowserNotifications(reminders: OverdueReminder[]): Promise<void> {
  if (typeof Notification === "undefined") return;
  if (reminders.length === 0) return;
  if (hasNotifiedToday()) return;

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") return;

  const count = reminders.length;
  const names = reminders
    .slice(0, 3)
    .map((r) => r.memberName)
    .join("、");
  const body =
    count <= 3
      ? `${names} との 1on1 が未実施です`
      : `${names} ほか ${count}人 との 1on1 が未実施です`;

  new Notification("Nudge: ミーティングリマインダー", {
    body,
    icon: "/favicon.ico",
  });

  markNotifiedToday();
}

export function BrowserNotification({ reminders }: Props) {
  useEffect(() => {
    sendBrowserNotifications(reminders).catch(() => {
      // 通知失敗は無視
    });
  }, [reminders]);

  return null;
}
