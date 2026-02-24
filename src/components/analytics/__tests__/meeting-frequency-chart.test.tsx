import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingFrequencyChart } from "../meeting-frequency-chart";

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
    expect(screen.getByText("1on1を実施すると、月次実施回数グラフが表示されます")).toBeDefined();
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
