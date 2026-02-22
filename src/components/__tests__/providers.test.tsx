import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Providers } from "../providers";

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

describe("Providers", () => {
  it("children を ThemeProvider でラップして描画する", () => {
    render(
      <Providers>
        <span>テストコンテンツ</span>
      </Providers>,
    );
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
  });
});
