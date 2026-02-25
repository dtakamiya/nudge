import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TopicDistributionChart } from "../topic-distribution-chart";

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
    expect(screen.getAllByTestId("pie-chart").length).toBeGreaterThan(0);
  });

  it("renders card title", () => {
    render(<TopicDistributionChart data={[]} />);
    expect(screen.getByText("話題カテゴリの分布")).toBeDefined();
  });

  it("データがあるときスクリーンリーダー向けテーブルを表示する", () => {
    const data = [
      { category: "WORK_PROGRESS" as const, count: 5 },
      { category: "CAREER" as const, count: 3 },
    ];
    render(<TopicDistributionChart data={data} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly?.textContent).toContain("業務進捗");
  });
});
