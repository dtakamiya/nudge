import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ActionAnalyticsSection } from "../action-analytics-section";
import * as analyticsActions from "@/lib/actions/analytics-actions";

// Mock the server action
vi.mock("@/lib/actions/analytics-actions", () => ({
  getMemberActionTrends: vi.fn(),
}));

// Mock the custom charts so we don't need to test recharts internal rendering here
vi.mock("../action-completion-trend-chart", () => ({
  ActionCompletionTrendChart: ({ data }: { data: any }) => (
    <div data-testid="trend-chart">{JSON.stringify(data)}</div>
  ),
}));

vi.mock("../action-kpi-cards", () => ({
  ActionKpiCards: ({ onTimeRate, averageDays }: { onTimeRate: number; averageDays: number }) => (
    <div data-testid="kpi-cards">
      Rate: {onTimeRate}, Days: {averageDays}
    </div>
  ),
}));

describe("ActionAnalyticsSection", () => {
  it("renders null if no action data (0 trends)", async () => {
    vi.mocked(analyticsActions.getMemberActionTrends).mockResolvedValueOnce({
      averageCompletionDays: 0,
      onTimeCompletionRate: 0,
      monthlyTrends: [],
    });

    const { container } = render(await ActionAnalyticsSection({ memberId: "m1" }));
    expect(container.innerHTML).toBe("");
  });

  it("renders charts and kpis if data exists", async () => {
    vi.mocked(analyticsActions.getMemberActionTrends).mockResolvedValueOnce({
      averageCompletionDays: 3.5,
      onTimeCompletionRate: 85,
      monthlyTrends: [{ month: "2026-01", created: 5, completed: 4 }],
    });

    render(await ActionAnalyticsSection({ memberId: "m1" }));

    expect(screen.getByText("アクションアイテムの傾向")).toBeDefined();
    expect(screen.getByTestId("kpi-cards").textContent).toContain("Rate: 85, Days: 3.5");
    expect(screen.getByTestId("trend-chart").textContent).toContain("2026-01");
  });
});
