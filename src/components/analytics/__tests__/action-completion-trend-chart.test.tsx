import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionCompletionTrendChart } from "../action-completion-trend-chart";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ActionCompletionTrendChart", () => {
  it("renders empty state when no data", () => {
    render(<ActionCompletionTrendChart data={[]} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });

  it("renders line chart when data exists", () => {
    const data = [
      { month: "2026-01", created: 5, completed: 4 },
      { month: "2026-02", created: 3, completed: 3 },
    ];
    render(<ActionCompletionTrendChart data={data} />);
    expect(screen.getByTestId("line-chart")).toBeDefined();
  });

  it("renders card title", () => {
    render(<ActionCompletionTrendChart data={[]} />);
    expect(screen.getByText("月次完了トレンド")).toBeDefined();
  });

  it("データがあるときスクリーンリーダー向けテーブルを表示する", () => {
    const data = [
      { month: "2026-01", created: 5, completed: 4 },
      { month: "2026-02", created: 3, completed: 3 },
    ];
    render(<ActionCompletionTrendChart data={data} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly?.textContent).toContain("2026-01");
  });
});
