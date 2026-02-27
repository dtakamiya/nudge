import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QualityTrendEntry } from "@/lib/actions/analytics-actions";

import { QualityTrendChart } from "../quality-trend-chart";

// Recharts のモック（SSR 対策）
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

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

describe("QualityTrendChart", () => {
  it("3件未満のデータではメッセージを表示", () => {
    const data: QualityTrendEntry[] = [{ date: "2026/01/15", quality: 4, usefulness: 3 }];
    render(<QualityTrendChart data={data} />);
    expect(screen.getByText(/3回以上/)).toBeInTheDocument();
  });

  it("3件以上のデータではチャートを表示", () => {
    const data: QualityTrendEntry[] = [
      { date: "2026/01/15", quality: 4, usefulness: 3 },
      { date: "2026/02/15", quality: 5, usefulness: 4 },
      { date: "2026/03/15", quality: 3, usefulness: 5 },
    ];
    render(<QualityTrendChart data={data} />);
    expect(screen.queryByText(/3回以上/)).not.toBeInTheDocument();
  });

  it("スクリーンリーダー向け代替テーブルを表示", () => {
    const data: QualityTrendEntry[] = [
      { date: "2026/01/15", quality: 4, usefulness: 3 },
      { date: "2026/02/15", quality: 5, usefulness: 4 },
      { date: "2026/03/15", quality: 3, usefulness: 5 },
    ];
    render(<QualityTrendChart data={data} />);
    expect(screen.getByText("品質スコアの推移（3 回分）")).toBeInTheDocument();
  });

  it("タイトルが表示される", () => {
    render(<QualityTrendChart data={[]} />);
    expect(screen.getByText("品質スコアの推移")).toBeInTheDocument();
  });
});
