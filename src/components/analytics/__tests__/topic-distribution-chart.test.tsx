import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TopicDistributionChart } from "../topic-distribution-chart";

afterEach(() => cleanup());

describe("TopicDistributionChart", () => {
  it("renders empty state when no data", () => {
    render(<TopicDistributionChart data={[]} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });

  it("renders pie chart when data exists", () => {
    const data = [
      { category: "WORK_PROGRESS" as const, count: 5 },
      { category: "CAREER" as const, count: 3 },
    ];
    render(<TopicDistributionChart data={data} />);
    expect(screen.getByTestId("pie-chart")).toBeDefined();
  });

  it("renders card title", () => {
    render(<TopicDistributionChart data={[]} />);
    expect(screen.getByText("話題カテゴリの分布")).toBeDefined();
  });
});
