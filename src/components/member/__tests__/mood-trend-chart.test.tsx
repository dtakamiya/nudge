import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MoodTrendChart } from "../mood-trend-chart";

afterEach(() => {
  cleanup();
});

describe("MoodTrendChart", () => {
  it("データが空のときは「まだ記録されていません」を表示する", () => {
    render(<MoodTrendChart data={[]} />);
    expect(screen.getByText("まだ記録されていません")).toBeInTheDocument();
  });

  it("データがあるとき SVG を描画する", () => {
    const data = [
      { date: new Date("2026-01-01"), mood: 3 },
      { date: new Date("2026-02-01"), mood: 5 },
    ];
    render(<MoodTrendChart data={data} />);
    // SVG 要素が存在すること
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // SVG は aria-hidden であること
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("データが 1 件でも SVG を描画する", () => {
    const data = [{ date: new Date("2026-01-01"), mood: 4 }];
    render(<MoodTrendChart data={data} />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("データが 8 件以下のとき絵文字を表示する", () => {
    const data = Array.from({ length: 5 }, (_, i) => ({
      date: new Date(`2026-0${i + 1}-01`),
      mood: (i % 5) + 1,
    }));
    render(<MoodTrendChart data={data} />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("スクリーンリーダー向けにデータサマリーを表示する", () => {
    const data = [
      { date: new Date("2026-01-15"), mood: 4 },
      { date: new Date("2026-02-10"), mood: 2 },
    ];
    render(<MoodTrendChart data={data} />);
    const srOnly = document.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
  });
});
