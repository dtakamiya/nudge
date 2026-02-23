import { act,renderHook } from "@testing-library/react";
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { useElapsedTime } from "../use-elapsed-time";

describe("useElapsedTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("startedAt が null の場合は「00:00」を返す", () => {
    const { result } = renderHook(() => useElapsedTime(null));
    expect(result.current.formatted).toBe("00:00");
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it("経過時間が正しく計算される", () => {
    const startedAt = new Date(Date.now() - 5 * 60 * 1000 - 32 * 1000); // 5分32秒前
    const { result } = renderHook(() => useElapsedTime(startedAt));
    expect(result.current.formatted).toBe("05:32");
  });

  it("1秒後にフォーマットが更新される", () => {
    const startedAt = new Date();
    const { result } = renderHook(() => useElapsedTime(startedAt));

    expect(result.current.formatted).toBe("00:00");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.formatted).toBe("00:01");
  });

  it("1時間以上の場合 H:MM:SS 形式になる", () => {
    const startedAt = new Date(Date.now() - (1 * 60 * 60 + 5 * 60 + 30) * 1000); // 1時間5分30秒前
    const { result } = renderHook(() => useElapsedTime(startedAt));
    expect(result.current.formatted).toBe("1:05:30");
  });
});
