import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FocusModeProvider, useFocusMode } from "../use-focus-mode";

describe("useFocusMode", () => {
  it("初期状態でフォーカスモードが無効", () => {
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: FocusModeProvider,
    });
    expect(result.current.isFocusMode).toBe(false);
  });

  it("toggleFocusModeでフォーカスモードが切り替わる", () => {
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: FocusModeProvider,
    });
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(false);
  });

  it("setFocusModeで明示的に設定できる", () => {
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: FocusModeProvider,
    });
    act(() => {
      result.current.setFocusMode(true);
    });
    expect(result.current.isFocusMode).toBe(true);
    act(() => {
      result.current.setFocusMode(false);
    });
    expect(result.current.isFocusMode).toBe(false);
  });

  it("FocusModeProvider外でuseFocusModeを呼ぶとエラー", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useFocusMode());
    }).toThrow("useFocusMode must be used within a FocusModeProvider");
    consoleSpy.mockRestore();
  });
});
