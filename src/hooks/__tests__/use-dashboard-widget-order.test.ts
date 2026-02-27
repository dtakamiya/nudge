import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { WIDGET_KEYS, type WidgetKey } from "../use-dashboard-widget-settings";
import { DEFAULT_WIDGET_ORDER, useDashboardWidgetOrder } from "../use-dashboard-widget-order";

const ORDER_STORAGE_KEY = "nudge-dashboard-widget-order";

describe("useDashboardWidgetOrder", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("デフォルトではWIDGET_KEYSの順序を返す", () => {
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order).toEqual(WIDGET_KEYS);
  });

  it("localStorageから保存された順序を読み込む", () => {
    const customOrder: WidgetKey[] = [
      "memberList",
      "summary",
      "healthScore",
      "recentActivity",
      "upcomingActions",
      "scheduledMeetings",
      "recommendedMeetings",
    ];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(customOrder));
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order).toEqual(customOrder);
  });

  it("reorderで並び替えができる", () => {
    const { result } = renderHook(() => useDashboardWidgetOrder());
    act(() => {
      result.current.reorder("summary", "healthScore");
    });
    expect(result.current.order[0]).toBe("healthScore");
    expect(result.current.order[1]).toBe("summary");
  });

  it("reorder後にlocalStorageへ保存される", () => {
    const { result } = renderHook(() => useDashboardWidgetOrder());
    act(() => {
      result.current.reorder("summary", "healthScore");
    });
    const stored = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) ?? "[]");
    expect(stored[0]).toBe("healthScore");
    expect(stored[1]).toBe("summary");
  });

  it("resetOrderでデフォルト順序に戻る", () => {
    const customOrder: WidgetKey[] = [
      "memberList",
      "summary",
      "healthScore",
      "recentActivity",
      "upcomingActions",
      "scheduledMeetings",
      "recommendedMeetings",
    ];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(customOrder));
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order[0]).toBe("memberList");
    act(() => {
      result.current.resetOrder();
    });
    expect(result.current.order).toEqual(WIDGET_KEYS);
  });

  it("localStorageに未知のキーがある場合は除外される", () => {
    const badOrder = ["unknownKey", "summary", "healthScore"];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(badOrder));
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order).not.toContain("unknownKey");
    expect(result.current.order.length).toBe(WIDGET_KEYS.length);
  });

  it("localStorageに足りないキーがある場合は末尾に補完される", () => {
    const partialOrder: WidgetKey[] = ["memberList", "summary"];
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(partialOrder));
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order[0]).toBe("memberList");
    expect(result.current.order[1]).toBe("summary");
    expect(result.current.order.length).toBe(WIDGET_KEYS.length);
  });

  it("localStorageが壊れている場合はデフォルト順序を使う", () => {
    localStorage.setItem(ORDER_STORAGE_KEY, "invalid json{{{");
    const { result } = renderHook(() => useDashboardWidgetOrder());
    expect(result.current.order).toEqual(WIDGET_KEYS);
  });

  it("同じIDでreorderした場合は変更されない", () => {
    const { result } = renderHook(() => useDashboardWidgetOrder());
    const before = [...result.current.order];
    act(() => {
      result.current.reorder("summary", "summary");
    });
    expect(result.current.order).toEqual(before);
  });
});
