import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConditionSelector } from "../condition-selector";

afterEach(() => {
  cleanup();
});

describe("ConditionSelector", () => {
  const defaultProps = {
    conditionHealth: null,
    conditionMood: null,
    conditionWorkload: null,
    onConditionChange: vi.fn(),
  };

  it("3軸のラベルが表示されること", () => {
    render(<ConditionSelector {...defaultProps} />);
    expect(screen.getByText(/体調/)).toBeInTheDocument();
    expect(screen.getByText(/気分/)).toBeInTheDocument();
    expect(screen.getByText(/業務量/)).toBeInTheDocument();
  });

  it("各軸に5つのボタンが表示されること（合計15ボタン）", () => {
    render(<ConditionSelector {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(15);
  });

  it("体調のボタンをクリックすると conditionHealth で onConditionChange が呼ばれること", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConditionSelector {...defaultProps} onConditionChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    // 最初の5つが体調ボタン
    await user.click(buttons[2]); // value=3
    expect(handleChange).toHaveBeenCalledWith("conditionHealth", 3);
  });

  it("気分のボタンをクリックすると conditionMood で onConditionChange が呼ばれること", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConditionSelector {...defaultProps} onConditionChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    // 6〜10番目が気分ボタン
    await user.click(buttons[5]); // value=1
    expect(handleChange).toHaveBeenCalledWith("conditionMood", 1);
  });

  it("業務量のボタンをクリックすると conditionWorkload で onConditionChange が呼ばれること", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ConditionSelector {...defaultProps} onConditionChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    // 11〜15番目が業務量ボタン
    await user.click(buttons[10]); // value=1
    expect(handleChange).toHaveBeenCalledWith("conditionWorkload", 1);
  });

  it("選択済みのボタンに aria-pressed=true が付くこと", () => {
    render(<ConditionSelector {...defaultProps} conditionHealth={3} />);
    const buttons = screen.getAllByRole("button");
    // 体調の3番目（index=2）が選択済み
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("選択済みと同じボタンを再クリックすると null で onConditionChange が呼ばれること", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ConditionSelector {...defaultProps} conditionHealth={2} onConditionChange={handleChange} />,
    );
    const buttons = screen.getAllByRole("button");
    // 体調の2番目（index=1）をクリック → null
    await user.click(buttons[1]);
    expect(handleChange).toHaveBeenCalledWith("conditionHealth", null);
  });

  it("体調行に最小ラベル「悪い」と最大ラベル「良い」が表示されること", () => {
    render(<ConditionSelector {...defaultProps} />);
    const allBadText = screen.getAllByText("悪い");
    const allGoodText = screen.getAllByText("良い");
    expect(allBadText.length).toBeGreaterThanOrEqual(1);
    expect(allGoodText.length).toBeGreaterThanOrEqual(1);
  });

  it("業務量行に最小ラベル「少ない」と最大ラベル「多い」が表示されること", () => {
    render(<ConditionSelector {...defaultProps} />);
    expect(screen.getByText("少ない")).toBeInTheDocument();
    expect(screen.getByText("多い")).toBeInTheDocument();
  });

  it("各軸の最小・最大ラベルが合計6つ表示されること（min×3, max×3）", () => {
    render(<ConditionSelector {...defaultProps} />);
    // 体調: 悪い/良い, 気分: 悪い/良い, 業務量: 少ない/多い
    const minLabels = screen.getAllByText(/^(悪い|少ない)$/);
    const maxLabels = screen.getAllByText(/^(良い|多い)$/);
    expect(minLabels).toHaveLength(3);
    expect(maxLabels).toHaveLength(3);
  });
});
