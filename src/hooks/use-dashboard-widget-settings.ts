"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "nudge-dashboard-widgets";

export type WidgetKey =
  | "summary"
  | "healthScore"
  | "recentActivity"
  | "upcomingActions"
  | "scheduledMeetings"
  | "recommendedMeetings"
  | "memberList";

export type WidgetSettings = Record<WidgetKey, boolean>;

export const WIDGET_KEYS: WidgetKey[] = [
  "summary",
  "healthScore",
  "recentActivity",
  "upcomingActions",
  "scheduledMeetings",
  "recommendedMeetings",
  "memberList",
];

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  summary: "サマリー",
  healthScore: "健全性スコア",
  recentActivity: "最近のアクティビティ",
  upcomingActions: "今週のタスク",
  scheduledMeetings: "今週の1on1予定",
  recommendedMeetings: "1on1すべきメンバー",
  memberList: "メンバー一覧",
};

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  summary: true,
  healthScore: true,
  recentActivity: true,
  upcomingActions: true,
  scheduledMeetings: true,
  recommendedMeetings: true,
  memberList: true,
};

function loadSettings(): WidgetSettings {
  if (typeof window === "undefined") return DEFAULT_WIDGET_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_WIDGET_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<WidgetSettings>;
    return { ...DEFAULT_WIDGET_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_WIDGET_SETTINGS;
  }
}

function saveSettings(settings: WidgetSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage 利用不可の場合は無視
  }
}

export function useDashboardWidgetSettings() {
  const [settings, setSettings] = useState<WidgetSettings>(() => loadSettings());

  const visibleCount = WIDGET_KEYS.filter((key) => settings[key]).length;

  const toggle = useCallback(
    (key: WidgetKey) => {
      if (settings[key] && visibleCount === 1) return;
      setSettings((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        saveSettings(next);
        return next;
      });
    },
    [settings, visibleCount],
  );

  return { settings, toggle, visibleCount };
}
