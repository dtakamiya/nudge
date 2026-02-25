import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CheckinSummary } from "../checkin-summary";

afterEach(() => {
  cleanup();
});

describe("CheckinSummary", () => {
  it("データが空のときは「チェックインデータがありません」を表示する", () => {
    render(<CheckinSummary data={[]} />);
    expect(screen.getByText("チェックインデータがありません")).toBeInTheDocument();
  });

  it("データがあるとき3つの指標ラベルを表示する", () => {
    const data = [
      { date: "2026-01-01", health: 4, mood: 3, workload: 2 },
      { date: "2026-01-08", health: 5, mood: 4, workload: 3 },
    ];
    render(<CheckinSummary data={data} />);
    expect(screen.getByText("体調")).toBeInTheDocument();
    expect(screen.getByText("気分")).toBeInTheDocument();
    expect(screen.getByText("負荷")).toBeInTheDocument();
  });

  it("5件のデータを表示できる", () => {
    const data = [
      { date: "2026-01-01", health: 4, mood: 3, workload: 2 },
      { date: "2026-01-08", health: 5, mood: 4, workload: 3 },
      { date: "2026-01-15", health: 3, mood: 3, workload: 4 },
      { date: "2026-01-22", health: 4, mood: 5, workload: 2 },
      { date: "2026-01-29", health: 2, mood: 2, workload: 5 },
    ];
    render(<CheckinSummary data={data} />);
    // 最新ラベルが表示される
    expect(screen.getByText("最新")).toBeInTheDocument();
  });

  it("nullスコアの場合もクラッシュしない", () => {
    const data = [
      { date: "2026-01-01", health: null, mood: 3, workload: null },
      { date: "2026-01-08", health: 5, mood: null, workload: 3 },
    ];
    render(<CheckinSummary data={data} />);
    expect(screen.getByText("体調")).toBeInTheDocument();
  });

  it("スコア1-2のとき危険色クラスが適用される", () => {
    const data = [{ date: "2026-01-01", health: 1, mood: 2, workload: 1 }];
    const { container } = render(<CheckinSummary data={data} />);
    const dangerDots = container.querySelectorAll("[data-score-level='danger']");
    expect(dangerDots.length).toBeGreaterThan(0);
  });

  it("スコア3のとき警告色クラスが適用される", () => {
    const data = [{ date: "2026-01-01", health: 3, mood: 3, workload: 3 }];
    const { container } = render(<CheckinSummary data={data} />);
    const warningDots = container.querySelectorAll("[data-score-level='warning']");
    expect(warningDots.length).toBeGreaterThan(0);
  });

  it("スコア4-5のとき良好色クラスが適用される", () => {
    const data = [{ date: "2026-01-01", health: 4, mood: 5, workload: 4 }];
    const { container } = render(<CheckinSummary data={data} />);
    const goodDots = container.querySelectorAll("[data-score-level='good']");
    expect(goodDots.length).toBeGreaterThan(0);
  });

  it("1件のデータでも正しく表示される", () => {
    const data = [{ date: "2026-01-01", health: 4, mood: 3, workload: 2 }];
    render(<CheckinSummary data={data} />);
    expect(screen.getByText("体調")).toBeInTheDocument();
    expect(screen.getByText("最新")).toBeInTheDocument();
  });
});
