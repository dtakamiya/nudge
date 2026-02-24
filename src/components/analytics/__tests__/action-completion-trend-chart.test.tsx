import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionCompletionTrendChart } from "../action-completion-trend-chart";

vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

afterEach(() => cleanup());

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
});
