import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AutoSaveIndicator } from "../auto-save-indicator";

describe("AutoSaveIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("idle 状態では何も表示されない", () => {
    render(<AutoSaveIndicator status="idle" />);
    expect(screen.queryByText("保存中...")).toBeNull();
    expect(screen.queryByText("保存済み")).toBeNull();
    expect(screen.queryByText("保存に失敗しました")).toBeNull();
  });

  it("saving 状態では「保存中...」が表示される", () => {
    render(<AutoSaveIndicator status="saving" />);
    expect(screen.getByText("保存中...")).toBeTruthy();
  });

  it("saved 状態では「保存済み」が表示される", () => {
    render(<AutoSaveIndicator status="saved" />);
    expect(screen.getByText("保存済み")).toBeTruthy();
  });

  it("saved 状態では 3秒後に onIdle が呼ばれる", () => {
    const onIdle = vi.fn();
    render(<AutoSaveIndicator status="saved" onIdle={onIdle} />);
    expect(onIdle).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("saved 状態で 3秒経過前は onIdle が呼ばれない", () => {
    const onIdle = vi.fn();
    render(<AutoSaveIndicator status="saved" onIdle={onIdle} />);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onIdle).not.toHaveBeenCalled();
  });

  it("error 状態では「保存に失敗しました」が表示される", () => {
    render(<AutoSaveIndicator status="error" />);
    expect(screen.getByText("保存に失敗しました")).toBeTruthy();
  });

  it("error 状態では「再試行」ボタンが表示される", () => {
    render(<AutoSaveIndicator status="error" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "再試行" })).toBeTruthy();
  });

  it("「再試行」ボタンクリックで onRetry が呼ばれる", async () => {
    const onRetry = vi.fn();
    render(<AutoSaveIndicator status="error" onRetry={onRetry} />);
    const button = screen.getByRole("button", { name: "再試行" });
    await act(async () => {
      button.click();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("status が saved から idle に変わった場合にタイマーがリセットされる", () => {
    const onIdle = vi.fn();
    const { rerender } = render(<AutoSaveIndicator status="saved" onIdle={onIdle} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender(<AutoSaveIndicator status="idle" onIdle={onIdle} />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // idle に変わった後は onIdle は呼ばれない
    expect(onIdle).not.toHaveBeenCalled();
  });
});
