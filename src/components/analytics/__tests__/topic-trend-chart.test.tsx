import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TopicTrendChart } from "../topic-trend-chart";

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

afterEach(() => cleanup());

describe("TopicTrendChart", () => {
  it("renders empty state when no data", () => {
    render(<TopicTrendChart data={[]} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });

  it("renders bar chart when data exists", () => {
    const data = [{ month: "2026-01", WORK_PROGRESS: 3, CAREER: 1 }];
    render(<TopicTrendChart data={data} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("renders card title", () => {
    render(<TopicTrendChart data={[]} />);
    expect(screen.getByText("話題の時系列推移")).toBeDefined();
  });
});
