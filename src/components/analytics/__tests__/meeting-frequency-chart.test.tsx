import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeetingFrequencyChart } from "../meeting-frequency-chart";

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("MeetingFrequencyChart", () => {
  it("renders empty state when no data", () => {
    render(<MeetingFrequencyChart data={[]} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });

  it("renders bar chart when data exists", () => {
    const data = [
      { month: "2026-01", count: 3 },
      { month: "2026-02", count: 5 },
    ];
    render(<MeetingFrequencyChart data={data} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });
});
