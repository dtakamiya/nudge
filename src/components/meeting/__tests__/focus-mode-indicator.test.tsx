import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as focusModeModule from "@/hooks/use-focus-mode";

import { FocusModeIndicator } from "../focus-mode-indicator";

describe("FocusModeIndicator", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("フォーカスモードがOFFのとき何も表示しない", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });
    const { container } = render(<FocusModeIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("フォーカスモードがONのときインジケーターを表示する", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: true,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });
    render(<FocusModeIndicator />);
    expect(screen.getByRole("button", { name: /フォーカスモードを終了/ })).toBeInTheDocument();
  });

  it("ボタンをクリックするとtoggleFocusModeが呼ばれる", () => {
    const toggleFocusMode = vi.fn();
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: true,
      toggleFocusMode,
      setFocusMode: vi.fn(),
    });
    render(<FocusModeIndicator />);
    fireEvent.click(screen.getByRole("button", { name: /フォーカスモードを終了/ }));
    expect(toggleFocusMode).toHaveBeenCalledOnce();
  });
});
