import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_WIDGET_SETTINGS,
  useDashboardWidgetSettings,
  WIDGET_KEYS,
  WIDGET_LABELS,
} from "../use-dashboard-widget-settings";

const STORAGE_KEY = "nudge-dashboard-widgets";

describe("useDashboardWidgetSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("デフォルトでは全ウィジェットが表示状態", () => {
    const { result } = renderHook(() => useDashboardWidgetSettings());
    WIDGET_KEYS.forEach((key) => {
      expect(result.current.settings[key]).toBe(true);
    });
  });

  it("localStorageに保存された設定を読み込む", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_WIDGET_SETTINGS, healthScore: false }),
    );
    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {
      // useEffectが実行されるのを待つ
    });
    expect(result.current.settings.healthScore).toBe(false);
  });

  it("toggleでウィジェットをOFFにできる", () => {
    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {
      result.current.toggle("healthScore");
    });
    expect(result.current.settings.healthScore).toBe(false);
  });

  it("toggleでウィジェットをONに戻せる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_WIDGET_SETTINGS, healthScore: false }),
    );
    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {
      result.current.toggle("healthScore");
    });
    expect(result.current.settings.healthScore).toBe(true);
  });

  it("最後の1件は toggle できない（最低1件保証）", () => {
    // 全部OFFにして最後の1件だけ残す
    const oneVisible = { ...DEFAULT_WIDGET_SETTINGS };
    WIDGET_KEYS.forEach((k) => {
      oneVisible[k] = false;
    });
    oneVisible.summary = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oneVisible));

    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {
      result.current.toggle("summary");
    });
    // summary はまだ true のまま
    expect(result.current.settings.summary).toBe(true);
  });

  it("toggle後にlocalStorageへ保存される", () => {
    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {
      result.current.toggle("healthScore");
    });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.healthScore).toBe(false);
  });

  it("visibleCount が表示中ウィジェット数を返す", () => {
    const { result } = renderHook(() => useDashboardWidgetSettings());
    expect(result.current.visibleCount).toBe(WIDGET_KEYS.length);
    act(() => {
      result.current.toggle("healthScore");
    });
    expect(result.current.visibleCount).toBe(WIDGET_KEYS.length - 1);
  });

  it("localStorageが壊れている場合はデフォルト設定を使う", () => {
    localStorage.setItem(STORAGE_KEY, "invalid json{{{");
    const { result } = renderHook(() => useDashboardWidgetSettings());
    act(() => {});
    WIDGET_KEYS.forEach((key) => {
      expect(result.current.settings[key]).toBe(true);
    });
  });

  it("WIDGET_LABELS にすべてのキーのラベルが定義されている", () => {
    WIDGET_KEYS.forEach((key) => {
      expect(WIDGET_LABELS[key]).toBeDefined();
      expect(typeof WIDGET_LABELS[key]).toBe("string");
    });
  });
});
