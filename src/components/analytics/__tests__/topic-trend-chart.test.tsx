import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TopicTrendChart } from "../topic-trend-chart";

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

  it("データがあるときスクリーンリーダー向けテーブルを表示する", () => {
    const data = [{ month: "2026-01", WORK_PROGRESS: 3, CAREER: 1 }];
    render(<TopicTrendChart data={data} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly?.textContent).toContain("2026-01");
  });
});
