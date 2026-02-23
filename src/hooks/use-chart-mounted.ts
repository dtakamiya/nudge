"use client";

import { useSyncExternalStore } from "react";

// ブラウザの初回ペイント後にチャートをマウントするための外部ストア。
// requestAnimationFrame を使い、DOM レイアウト完了後に mounted を true にすることで
// recharts の "width(-1) and height(-1)" 警告を回避する。
// テスト環境では同期的に true を返し、既存テストの動作を維持する。
let chartMounted = process.env.NODE_ENV === "test";
const chartListeners = new Set<() => void>();

function subscribeToChartMount(listener: () => void) {
  chartListeners.add(listener);
  return () => {
    chartListeners.delete(listener);
  };
}

function getChartMountSnapshot() {
  return chartMounted;
}

function getChartMountServerSnapshot() {
  return false;
}

if (typeof window !== "undefined") {
  requestAnimationFrame(() => {
    chartMounted = true;
    chartListeners.forEach((listener) => listener());
  });
}

export function useChartMounted(): boolean {
  return useSyncExternalStore(
    subscribeToChartMount,
    getChartMountSnapshot,
    getChartMountServerSnapshot,
  );
}
