import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GoalProgressBar } from "../goal-progress-bar";

afterEach(() => {
  cleanup();
});

describe("GoalProgressBar", () => {
  it("進捗0%を表示する", () => {
    render(<GoalProgressBar progress={0} />);
    expect(screen.getByText("0%")).toBeDefined();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("進捗50%を表示する", () => {
    render(<GoalProgressBar progress={50} />);
    expect(screen.getByText("50%")).toBeDefined();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
  });

  it("進捗100%を表示する", () => {
    render(<GoalProgressBar progress={100} />);
    expect(screen.getByText("100%")).toBeDefined();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });

  it("負の値を0にクランプする", () => {
    render(<GoalProgressBar progress={-10} />);
    expect(screen.getByText("0%")).toBeDefined();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("100超の値を100にクランプする", () => {
    render(<GoalProgressBar progress={120} />);
    expect(screen.getByText("100%")).toBeDefined();
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });

  it("aria-labelが正しい", () => {
    render(<GoalProgressBar progress={75} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-label")).toBe("進捗 75%");
  });

  it("size smでh-1.5クラスが適用される", () => {
    const { container } = render(<GoalProgressBar progress={50} size="sm" />);
    const trackDiv = container.querySelector(".h-1\\.5");
    expect(trackDiv).not.toBeNull();
  });

  it("size mdでh-2.5クラスが適用される", () => {
    const { container } = render(<GoalProgressBar progress={50} size="md" />);
    const trackDiv = container.querySelector(".h-2\\.5");
    expect(trackDiv).not.toBeNull();
  });
});
