import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useKeyboardVisibility } from "../use-keyboard-visibility";

describe("useKeyboardVisibility", () => {
  const originalVisualViewport = globalThis.visualViewport;

  afterEach(() => {
    Object.defineProperty(globalThis, "visualViewport", {
      value: originalVisualViewport,
      writable: true,
      configurable: true,
    });
  });

  it("visualViewport がない場合は false を返す", () => {
    Object.defineProperty(globalThis, "visualViewport", {
      value: null,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useKeyboardVisibility());
    expect(result.current).toBe(false);
  });

  it("viewport の高さが window の高さと同じなら false を返す", () => {
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(globalThis, "visualViewport", {
      value: {
        height: globalThis.innerHeight,
        addEventListener: (event: string, handler: EventListener) => {
          listeners.set(event, handler);
        },
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useKeyboardVisibility());
    expect(result.current).toBe(false);
  });

  it("viewport の高さが window の高さより 150px 以上小さいとき true を返す", () => {
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(globalThis, "visualViewport", {
      value: {
        height: globalThis.innerHeight - 200,
        addEventListener: (event: string, handler: EventListener) => {
          listeners.set(event, handler);
        },
        removeEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useKeyboardVisibility());

    const resizeHandler = listeners.get("resize");
    if (resizeHandler) {
      act(() => {
        resizeHandler(new Event("resize"));
      });
    }

    expect(result.current).toBe(true);
  });

  it("アンマウント時にリスナーが解除される", () => {
    const removeEventListener = vi.fn();
    Object.defineProperty(globalThis, "visualViewport", {
      value: {
        height: globalThis.innerHeight,
        addEventListener: vi.fn(),
        removeEventListener,
      },
      writable: true,
      configurable: true,
    });
    const { unmount } = renderHook(() => useKeyboardVisibility());
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
