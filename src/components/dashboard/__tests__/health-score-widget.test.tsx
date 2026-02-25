import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HealthScoreData } from "@/lib/actions/dashboard-actions";

import { HealthScoreWidget } from "../health-score-widget";

afterEach(() => {
  cleanup();
});

const baseData: HealthScoreData = {
  score: 100,
  healthyCount: 0,
  warningCount: 0,
  dangerCount: 0,
  memberStatuses: [],
};

describe("HealthScoreWidget", () => {
  it("スコアを表示する", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 75,
      healthyCount: 3,
      warningCount: 1,
      dangerCount: 0,
    };
    render(<HealthScoreWidget data={data} />);
    expect(screen.getByText("75")).toBeDefined();
  });

  it("メンバーがいない場合でもエラーなく表示される", () => {
    render(<HealthScoreWidget data={baseData} />);
    expect(screen.getByText("100")).toBeDefined();
  });

  it("各カウント（健全・注意・危険）を表示する", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 50,
      healthyCount: 2,
      warningCount: 1,
      dangerCount: 3,
      memberStatuses: [],
    };
    render(<HealthScoreWidget data={data} />);
    expect(screen.getByText("2")).toBeDefined(); // healthyCount
    expect(screen.getByText("3")).toBeDefined(); // dangerCount
  });

  it("メンバー名が一覧で表示される", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 50,
      healthyCount: 1,
      warningCount: 0,
      dangerCount: 1,
      memberStatuses: [
        { id: "1", name: "田中 一郎", status: "healthy", overdueDays: 0 },
        { id: "2", name: "佐藤 花子", status: "danger", overdueDays: 10 },
      ],
    };
    render(<HealthScoreWidget data={data} />);
    expect(screen.getByText("田中 一郎")).toBeDefined();
    expect(screen.getByText("佐藤 花子")).toBeDefined();
  });

  it("healthy ステータスのラベルを表示する", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 100,
      healthyCount: 1,
      memberStatuses: [{ id: "1", name: "A", status: "healthy", overdueDays: 0 }],
    };
    render(<HealthScoreWidget data={data} />);
    // CountBadge + MemberRow の両方に「健全」が表示される
    expect(screen.getAllByText("健全").length).toBeGreaterThanOrEqual(1);
  });

  it("warning ステータスのラベルを表示する", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 0,
      warningCount: 1,
      memberStatuses: [{ id: "1", name: "B", status: "warning", overdueDays: 5 }],
    };
    render(<HealthScoreWidget data={data} />);
    expect(screen.getAllByText("注意").length).toBeGreaterThanOrEqual(1);
  });

  it("danger ステータスのラベルを表示する", () => {
    const data: HealthScoreData = {
      ...baseData,
      score: 0,
      dangerCount: 1,
      memberStatuses: [{ id: "1", name: "C", status: "danger", overdueDays: 0 }],
    };
    render(<HealthScoreWidget data={data} />);
    expect(screen.getAllByText("危険").length).toBeGreaterThanOrEqual(1);
  });

  it("スコアが低いとき警告色（赤系）のクラスが適用される", () => {
    const data: HealthScoreData = { ...baseData, score: 30, dangerCount: 2 };
    const { container } = render(<HealthScoreWidget data={data} />);
    // スコア表示要素に danger 系クラスが含まれること
    const scoreEl = container.querySelector("[data-testid='health-score-value']");
    expect(scoreEl?.className).toContain("destructive");
  });

  it("スコアが高いとき成功色（緑系）のクラスが適用される", () => {
    const data: HealthScoreData = { ...baseData, score: 90, healthyCount: 3 };
    const { container } = render(<HealthScoreWidget data={data} />);
    const scoreEl = container.querySelector("[data-testid='health-score-value']");
    expect(scoreEl?.className).toContain("success");
  });

  describe("スナップショット", () => {
    it("スコア100・メンバーなしのデフォルト状態", () => {
      const { asFragment } = render(<HealthScoreWidget data={baseData} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("スコア50・複数メンバー（健全・注意・危険混在）の状態", () => {
      const data: HealthScoreData = {
        score: 50,
        healthyCount: 2,
        warningCount: 1,
        dangerCount: 1,
        memberStatuses: [
          { id: "1", name: "田中 一郎", status: "healthy", overdueDays: 0 },
          { id: "2", name: "佐藤 花子", status: "warning", overdueDays: 3 },
          { id: "3", name: "鈴木 次郎", status: "danger", overdueDays: 10 },
        ],
      };
      const { asFragment } = render(<HealthScoreWidget data={data} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("スコア30・全員危険ステータスの状態", () => {
      const data: HealthScoreData = {
        score: 30,
        healthyCount: 0,
        warningCount: 0,
        dangerCount: 2,
        memberStatuses: [
          { id: "1", name: "山田 太郎", status: "danger", overdueDays: 15 },
          { id: "2", name: "伊藤 三郎", status: "danger", overdueDays: 20 },
        ],
      };
      const { asFragment } = render(<HealthScoreWidget data={data} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
