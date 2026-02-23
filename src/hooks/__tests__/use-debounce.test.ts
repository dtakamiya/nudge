import { act,renderHook } from "@testing-library/react";
import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期値がそのまま返される", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("delay後に更新された値が返される", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // まだ更新されていない

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("delay前に値が再度変わった場合、前の値はスキップされる", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "first" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("second"); // "first" はスキップ
  });
});
