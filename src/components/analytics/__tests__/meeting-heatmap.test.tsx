import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HeatmapData } from "@/lib/actions/analytics-actions";

import { MeetingHeatmap } from "../meeting-heatmap";

const emptyData: HeatmapData = {
  members: [],
  months: [
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
  ],
};

const sampleData: HeatmapData = {
  members: [
    {
      memberId: "member-1",
      memberName: "田中 太郎",
      months: [
        { month: "2025-03", count: 0 },
        { month: "2025-04", count: 1 },
        { month: "2025-05", count: 0 },
        { month: "2025-06", count: 2 },
        { month: "2025-07", count: 0 },
        { month: "2025-08", count: 3 },
        { month: "2025-09", count: 0 },
        { month: "2025-10", count: 4 },
        { month: "2025-11", count: 0 },
        { month: "2025-12", count: 1 },
        { month: "2026-01", count: 0 },
        { month: "2026-02", count: 2 },
      ],
    },
    {
      memberId: "member-2",
      memberName: "鈴木 花子",
      months: [
        { month: "2025-03", count: 1 },
        { month: "2025-04", count: 0 },
        { month: "2025-05", count: 2 },
        { month: "2025-06", count: 0 },
        { month: "2025-07", count: 1 },
        { month: "2025-08", count: 0 },
        { month: "2025-09", count: 3 },
        { month: "2025-10", count: 0 },
        { month: "2025-11", count: 1 },
        { month: "2025-12", count: 0 },
        { month: "2026-01", count: 2 },
        { month: "2026-02", count: 0 },
      ],
    },
  ],
  months: [
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
  ],
};

describe("MeetingHeatmap", () => {
  it("メンバーがいない場合は空状態メッセージを表示する", () => {
    render(<MeetingHeatmap data={emptyData} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });

  it("メンバー名を表示する", () => {
    render(<MeetingHeatmap data={sampleData} />);
    expect(screen.getByText("田中 太郎")).toBeDefined();
    expect(screen.getByText("鈴木 花子")).toBeDefined();
  });

  it("月ヘッダーを表示する（M月形式）", () => {
    render(<MeetingHeatmap data={sampleData} />);
    // 月ヘッダーは "3月", "4月", ... と表示
    expect(screen.getAllByText("3月")).toBeDefined();
    expect(screen.getAllByText("2月")).toBeDefined();
  });

  it("ミーティング回数に応じたセルを表示する", () => {
    render(<MeetingHeatmap data={sampleData} />);
    // 各セルに title 属性でツールチップ情報を持つ
    const cells = screen.getAllByRole("cell");
    // メンバー2人 × 12ヶ月 = 24セル（ヘッダー行は含まない）
    expect(cells.length).toBeGreaterThanOrEqual(24);
  });

  it("凡例を表示する", () => {
    render(<MeetingHeatmap data={sampleData} />);
    expect(screen.getAllByText("0回").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4回以上").length).toBeGreaterThanOrEqual(1);
  });
});
