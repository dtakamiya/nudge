import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ThemeToggle } from "../theme-toggle";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "system",
    setTheme: mockSetTheme,
  })),
}));

import { useTheme } from "next-themes";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "system",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      forcedTheme: undefined,
    });
    mockSetTheme.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("3つのモードボタンを表示する", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "システム" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ライト" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ダーク" })).toBeInTheDocument();
  });

  it("ライトボタンをクリックすると setTheme('light') が呼ばれる", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "ライト" }));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("ダークボタンをクリックすると setTheme('dark') が呼ばれる", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "ダーク" }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("システムボタンをクリックすると setTheme('system') が呼ばれる", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "システム" }));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("現在のテーマのボタンにアクティブクラスが付く（dark の場合）", () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      forcedTheme: undefined,
    });
    render(<ThemeToggle />);
    const darkButton = screen.getByRole("button", { name: "ダーク" });
    expect(darkButton.className).toContain("bg-background");
  });
});
