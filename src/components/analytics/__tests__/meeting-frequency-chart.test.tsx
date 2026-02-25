import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MeetingFrequencyChart } from "../meeting-frequency-chart";

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
});

describe("MeetingFrequencyChart", () => {
  it("renders empty state when no data", () => {
    render(<MeetingFrequencyChart data={[]} />);
    expect(screen.getByText("まだデータがありません")).toBeDefined();
  });

  it("renders guidance message in empty state", () => {
    render(<MeetingFrequencyChart data={[]} />);
    expect(
      screen.getByText(
        "1on1を実施すると月次グラフが表示されます。まずはメンバーとの1on1を記録しましょう",
      ),
    ).toBeDefined();
  });

  it("renders bar chart when data exists", () => {
    const data = [
      { month: "2026-01", count: 3 },
      { month: "2026-02", count: 5 },
    ];
    render(<MeetingFrequencyChart data={data} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("データがあるときスクリーンリーダー向けテーブルを表示する", () => {
    const data = [
      { month: "2026-01", count: 3 },
      { month: "2026-02", count: 5 },
    ];
    render(<MeetingFrequencyChart data={data} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly?.textContent).toContain("2026-01");
  });
});
