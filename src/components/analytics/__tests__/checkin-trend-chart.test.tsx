import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckinTrendChart } from "../checkin-trend-chart";

afterEach(() => cleanup());

describe("CheckinTrendChart", () => {
  it("データが0件の場合にデータ不足メッセージを表示する", () => {
    render(<CheckinTrendChart data={[]} />);
    expect(screen.getByText("グラフを表示するには3回以上のチェックインが必要です")).toBeDefined();
  });

  it("データが2件の場合にデータ不足メッセージを表示する", () => {
    const data = [
      { date: "2026/01/01", health: 4, mood: 3, workload: 2 },
      { date: "2026/01/15", health: 5, mood: 4, workload: 3 },
    ];
    render(<CheckinTrendChart data={data} />);
    expect(screen.getByText("グラフを表示するには3回以上のチェックインが必要です")).toBeDefined();
  });

  it("データが3件以上の場合はグラフを表示する", () => {
    const data = [
      { date: "2026/01/01", health: 4, mood: 3, workload: 2 },
      { date: "2026/01/15", health: 5, mood: 4, workload: 3 },
      { date: "2026/02/01", health: 3, mood: 5, workload: 4 },
    ];
    render(<CheckinTrendChart data={data} />);
    expect(screen.getByTestId("line-chart")).toBeDefined();
  });

  it("カードタイトルを表示する", () => {
    render(<CheckinTrendChart data={[]} />);
    expect(screen.getByText("チェックイン状態の推移")).toBeDefined();
  });
});
