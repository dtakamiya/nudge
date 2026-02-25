"use client";

import { useEffect, useState } from "react";

/**
 * コンポーネントレベルでチャートのマウント状態を管理するフック。
 * useEffect 内で requestAnimationFrame を2フレーム待ちし、
 * DOM レイアウト完了後に mounted を true にすることで
 * recharts の "width(-1) and height(-1)" 警告を回避する。
 * テスト環境では同期的に true を返し、既存テストの動作を維持する。
 */
export function useChartMounted(): boolean {
  // ビルド時に静的置換されるため実行時に変化しない。
  // テストでの vi.stubEnv 対応のため関数内で評価する。
  const isTest = process.env.NODE_ENV === "test";
  const [mounted, setMounted] = useState(isTest);

  useEffect(() => {
    if (isTest) return;

    let secondFrameId: number | undefined;

    // 2フレーム待ちで DOM レイアウト完了を保証
    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        setMounted(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrameId);
      if (secondFrameId !== undefined) {
        cancelAnimationFrame(secondFrameId);
      }
    };
  }, [isTest]);

  return mounted;
}
