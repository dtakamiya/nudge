import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";

import { MobileFab } from "../mobile-fab";

vi.mock("@/hooks/use-keyboard-visibility", () => ({
  useKeyboardVisibility: vi.fn(() => false),
}));

const mockUseKeyboardVisibility = vi.mocked(useKeyboardVisibility);

const defaultProps = {
  onAddTopic: vi.fn(),
  onAddAction: vi.fn(),
};

describe("MobileFab", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseKeyboardVisibility.mockReturnValue(false);
  });

  it("FABボタンが表示される", () => {
    render(<MobileFab {...defaultProps} />);
    expect(screen.getByRole("button", { name: "追加メニュー" })).toBeTruthy();
  });

  it("FABボタンの最小サイズが 44x44px 以上", () => {
    render(<MobileFab {...defaultProps} />);
    const button = screen.getByRole("button", { name: "追加メニュー" });
    expect(button.className).toContain("min-h-[44px]");
    expect(button.className).toContain("min-w-[44px]");
  });

  it("FABをクリックするとメニューが開く", async () => {
    const user = userEvent.setup();
    render(<MobileFab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "追加メニュー" }));
    expect(screen.getByRole("button", { name: "話題を追加" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "アクション追加" })).toBeTruthy();
  });

  it("「話題を追加」をクリックすると onAddTopic が呼ばれメニューが閉じる", async () => {
    const user = userEvent.setup();
    render(<MobileFab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "追加メニュー" }));
    await user.click(screen.getByRole("button", { name: "話題を追加" }));
    expect(defaultProps.onAddTopic).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "話題を追加" })).toBeNull();
  });

  it("「アクション追加」をクリックすると onAddAction が呼ばれメニューが閉じる", async () => {
    const user = userEvent.setup();
    render(<MobileFab {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "追加メニュー" }));
    await user.click(screen.getByRole("button", { name: "アクション追加" }));
    expect(defaultProps.onAddAction).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "アクション追加" })).toBeNull();
  });
});

describe("MobileFab - キーボード表示時", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseKeyboardVisibility.mockReturnValue(false);
  });

  it("キーボード表示中はFABが非表示", () => {
    mockUseKeyboardVisibility.mockReturnValue(true);
    render(<MobileFab {...defaultProps} />);
    expect(screen.queryByRole("button", { name: "追加メニュー" })).toBeNull();
  });
});
