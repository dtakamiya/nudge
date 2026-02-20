import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DashboardSummary } from "../dashboard-summary";
import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

afterEach(() => {
  cleanup();
});

const baseSummary: DashboardSummaryType = {
  needsFollowUp: 0,
  actionCompletionRate: 0,
  totalActions: 0,
  completedActions: 0,
  meetingsThisMonth: 0,
  overdueActions: 0,
};

describe("DashboardSummary", () => {
  it("renders all four summary cards", () => {
    render(<DashboardSummary summary={baseSummary} />);
    expect(screen.getByText("要フォロー")).toBeDefined();
    expect(screen.getByText("アクション完了率")).toBeDefined();
    expect(screen.getByText("今月の1on1")).toBeDefined();
    expect(screen.getByText("期限超過")).toBeDefined();
  });

  it("displays needsFollowUp count", () => {
    const summary = { ...baseSummary, needsFollowUp: 3 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("人")).toBeDefined();
  });

  it("displays action completion rate as percentage", () => {
    const summary = {
      ...baseSummary,
      actionCompletionRate: 75,
      totalActions: 8,
      completedActions: 6,
    };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("75")).toBeDefined();
    expect(screen.getByText("%")).toBeDefined();
  });

  it("displays meetings this month count", () => {
    const summary = { ...baseSummary, meetingsThisMonth: 5 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("回")).toBeDefined();
  });

  it("displays overdue actions count", () => {
    const summary = { ...baseSummary, overdueActions: 2 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("件")).toBeDefined();
  });
});
