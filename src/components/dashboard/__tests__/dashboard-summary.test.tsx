import { cleanup,render, screen } from "@testing-library/react";
import { afterEach,describe, expect, it } from "vitest";

import type { DashboardSummary as DashboardSummaryType } from "@/lib/actions/dashboard-actions";

import { DashboardSummary } from "../dashboard-summary";

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
  it("renders four KPI cards", () => {
    render(<DashboardSummary summary={baseSummary} />);
    expect(screen.getByText("要フォロー")).toBeDefined();
    expect(screen.getByText("アクション完了率")).toBeDefined();
    expect(screen.getByText("今月の1on1")).toBeDefined();
    expect(screen.getByText("期限超過")).toBeDefined();
  });

  it("renders meetings this month card", () => {
    const summary = { ...baseSummary, meetingsThisMonth: 5 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("今月の1on1")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("回")).toBeDefined();
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

  it("displays overdue actions count", () => {
    const summary = { ...baseSummary, overdueActions: 2 };
    render(<DashboardSummary summary={summary} />);
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("件")).toBeDefined();
  });

  it("applies success border when needsFollowUp is 0", () => {
    render(<DashboardSummary summary={baseSummary} />);
    const card = screen.getByText("要フォロー").closest("[data-testid]");
    expect(card?.className).toContain("border-l-4");
    expect(card?.className).toContain("border-l-success");
  });

  it("applies warning border when needsFollowUp is 1-2", () => {
    const summary = { ...baseSummary, needsFollowUp: 2 };
    render(<DashboardSummary summary={summary} />);
    const card = screen.getByText("要フォロー").closest("[data-testid]");
    expect(card?.className).toContain("border-l-4");
    expect(card?.className).toContain("border-l-warning");
  });

  it("applies destructive border when needsFollowUp is 3+", () => {
    const summary = { ...baseSummary, needsFollowUp: 3 };
    render(<DashboardSummary summary={summary} />);
    const card = screen.getByText("要フォロー").closest("[data-testid]");
    expect(card?.className).toContain("border-l-4");
    expect(card?.className).toContain("border-l-destructive");
  });

  it("renders trend icons", () => {
    const summary = { ...baseSummary, needsFollowUp: 1 };
    render(<DashboardSummary summary={summary} />);
    // Each card should have an icon (svg element)
    const cards = screen.getAllByTestId(/^kpi-card-/);
    cards.forEach((card) => {
      expect(card.querySelector("svg")).not.toBeNull();
    });
  });

  it("uses lg:grid-cols-4 layout", () => {
    const { container } = render(<DashboardSummary summary={baseSummary} />);
    const grid = container.firstElementChild;
    expect(grid?.className).toContain("lg:grid-cols-4");
  });
});
