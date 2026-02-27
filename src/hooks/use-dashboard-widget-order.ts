"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

import { WIDGET_KEYS, type WidgetKey } from "./use-dashboard-widget-settings";

const ORDER_STORAGE_KEY = "nudge-dashboard-widget-order";

export const DEFAULT_WIDGET_ORDER: WidgetKey[] = [...WIDGET_KEYS];

function loadOrder(): WidgetKey[] {
  if (typeof window === "undefined") return DEFAULT_WIDGET_ORDER;
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!stored) return DEFAULT_WIDGET_ORDER;
    const parsed = JSON.parse(stored) as string[];
    // 有効なキーだけ抽出
    const validKeys = parsed.filter((k): k is WidgetKey => WIDGET_KEYS.includes(k as WidgetKey));
    // 足りないキーを末尾に補完
    const missingKeys = WIDGET_KEYS.filter((k) => !validKeys.includes(k));
    return [...validKeys, ...missingKeys];
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

function saveOrder(order: WidgetKey[]): void {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // localStorage 利用不可の場合は無視
  }
}

export function useDashboardWidgetOrder() {
  const [order, setOrder] = useState<WidgetKey[]>(() => loadOrder());

  const reorder = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(activeId as WidgetKey);
      const newIndex = prev.indexOf(overId as WidgetKey);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveOrder(next);
      return next;
    });
  }, []);

  const resetOrder = useCallback(() => {
    const defaultOrder = [...DEFAULT_WIDGET_ORDER];
    setOrder(defaultOrder);
    saveOrder(defaultOrder);
  }, []);

  return { order, reorder, resetOrder };
}
