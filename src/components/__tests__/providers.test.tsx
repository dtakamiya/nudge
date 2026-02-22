import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Providers } from "../providers";

const mockThemeProvider = vi.fn(
  ({ children }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
);

vi.mock("next-themes", () => ({
  ThemeProvider: (props: { children: React.ReactNode; [key: string]: unknown }) =>
    mockThemeProvider(props),
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

  it("ThemeProvider に attribute='class' が渡される", () => {
    render(
      <Providers>
        <span>test</span>
      </Providers>,
    );
    expect(mockThemeProvider).toHaveBeenCalledWith(expect.objectContaining({ attribute: "class" }));
  });

  it("ThemeProvider に defaultTheme='system' が渡される", () => {
    render(
      <Providers>
        <span>test</span>
      </Providers>,
    );
    expect(mockThemeProvider).toHaveBeenCalledWith(
      expect.objectContaining({ defaultTheme: "system" }),
    );
  });

  it("ThemeProvider に enableSystem=true が渡される", () => {
    render(
      <Providers>
        <span>test</span>
      </Providers>,
    );
    expect(mockThemeProvider).toHaveBeenCalledWith(expect.objectContaining({ enableSystem: true }));
  });
});
