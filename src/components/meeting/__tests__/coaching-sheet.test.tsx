import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// CoachingPanelをモック
vi.mock("../coaching-panel", () => ({
  CoachingPanel: ({ compact }: { compact?: boolean }) => (
    <div data-testid="coaching-panel" data-compact={compact}>
      CoachingPanel Mock
    </div>
  ),
}));

// Sheetコンポーネントをモック（radix-uiはjsdomで動かないため）
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, ...props }: React.PropsWithChildren) => (
    <div data-testid="sheet" {...props}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, ...props }: React.PropsWithChildren) => (
    <div data-testid="sheet-trigger" {...props}>
      {children}
    </div>
  ),
  SheetContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: React.PropsWithChildren) => (
    <div data-testid="sheet-title">{children}</div>
  ),
}));

import { CoachingSheet } from "../coaching-sheet";

afterEach(() => {
  cleanup();
});

describe("CoachingSheet", () => {
  it("トリガーボタンが表示されること", () => {
    render(<CoachingSheet />);
    expect(screen.getByRole("button", { name: /コーチングアシスト/ })).toBeInTheDocument();
  });

  it("Sheet内にCoachingPanelが表示されること", () => {
    render(<CoachingSheet />);
    expect(screen.getByTestId("coaching-panel")).toBeInTheDocument();
  });

  it("CoachingPanelにcompact=trueが渡されること", () => {
    render(<CoachingSheet />);
    expect(screen.getByTestId("coaching-panel")).toHaveAttribute("data-compact", "true");
  });

  it("Sheetのヘッダーにタイトルが表示されること", () => {
    render(<CoachingSheet />);
    expect(screen.getByText("コーチングアシスト")).toBeInTheDocument();
  });
});
