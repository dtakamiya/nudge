import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useChartMounted } from "../use-chart-mounted";

describe("useChartMounted", () => {
  it("テスト環境では同期的に true を返す", () => {
    const { result } = renderHook(() => useChartMounted());
    expect(result.current).toBe(true);
  });

  it("複数のフックインスタンスが独立して動作する", () => {
    const { result: result1 } = renderHook(() => useChartMounted());
    const { result: result2 } = renderHook(() => useChartMounted());
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it("boolean 型を返す", () => {
    const { result } = renderHook(() => useChartMounted());
    expect(typeof result.current).toBe("boolean");
  });

  describe("ブラウザ環境シミュレーション", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("初期状態では false を返し、2フレーム後に true になる", async () => {
      // requestAnimationFrame をモック
      const callbacks: FrameRequestCallback[] = [];
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        callbacks.push(cb);
        return callbacks.length;
      });

      const { result } = renderHook(() => useChartMounted());

      // 初期状態は false
      expect(result.current).toBe(false);

      // 1フレーム目を実行
      await act(() => {
        if (callbacks.length > 0) callbacks[0](16);
      });

      // まだ false（2フレーム待ち）
      expect(result.current).toBe(false);

      // 2フレーム目を実行
      await act(() => {
        if (callbacks.length > 1) callbacks[1](32);
      });

      // 2フレーム後に true
      expect(result.current).toBe(true);

      rafSpy.mockRestore();
    });

    it("アンマウント時に両フレームのリクエストがキャンセルされる", async () => {
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
      const callbacks: FrameRequestCallback[] = [];
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        callbacks.push(cb);
        return callbacks.length;
      });

      const { unmount } = renderHook(() => useChartMounted());

      // 1フレーム目のコールバックを実行して secondFrameId を設定する
      await act(() => {
        if (callbacks.length > 0) callbacks[0](16);
      });

      unmount();

      // firstFrameId (1) と secondFrameId (2) の両方がキャンセルされる
      expect(cancelSpy).toHaveBeenCalledTimes(2);
      expect(cancelSpy).toHaveBeenCalledWith(1);
      expect(cancelSpy).toHaveBeenCalledWith(2);

      cancelSpy.mockRestore();
      rafSpy.mockRestore();
    });
  });
});
