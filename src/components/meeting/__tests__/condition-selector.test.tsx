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

  it("体調・気分軸にスケール端絵文字 😞（最小）と 😊（最大）が表示されること", () => {
    render(<ConditionSelector {...defaultProps} />);
    const minEmojis = screen.getAllByText("😞");
    const maxEmojis = screen.getAllByText("😊");
    // 体調と気分の2軸分
    expect(minEmojis).toHaveLength(2);
    expect(maxEmojis).toHaveLength(2);
  });

  it("業務量軸にスケール端絵文字 😌（最小）と 😰（最大）が表示されること", () => {
    render(<ConditionSelector {...defaultProps} />);
    expect(screen.getByText("😌")).toBeInTheDocument();
    expect(screen.getByText("😰")).toBeInTheDocument();
  });

  it("各軸のスケール端絵文字が合計6つ表示されること（min×3, max×3）", () => {
    render(<ConditionSelector {...defaultProps} />);
    // min絵文字: 😞×2（体調・気分）+ 😌×1（業務量）= 3つ
    // max絵文字: 😊×2（体調・気分）+ 😰×1（業務量）= 3つ
    const minEmojis = screen.getAllByText(/^(😞|😌)$/);
    const maxEmojis = screen.getAllByText(/^(😊|😰)$/);
    expect(minEmojis).toHaveLength(3);
    expect(maxEmojis).toHaveLength(3);
  });

  describe("前回との差分表示", () => {
    it("前回データがない場合は差分が表示されないこと", () => {
      render(<ConditionSelector {...defaultProps} conditionHealth={3} />);
      expect(screen.queryByText(/前回より/)).toBeNull();
      expect(screen.queryByText(/前回と同じ/)).toBeNull();
    });

    it("現在値がない場合は差分が表示されないこと", () => {
      render(
        <ConditionSelector {...defaultProps} conditionHealth={null} previousConditionHealth={3} />,
      );
      expect(screen.queryByText(/前回より/)).toBeNull();
    });

    it("体調が前回より上がった場合に'↑ 前回より+1'が表示されること", () => {
      render(
        <ConditionSelector {...defaultProps} conditionHealth={4} previousConditionHealth={3} />,
      );
      expect(screen.getByText("↑ 前回より+1")).toBeInTheDocument();
    });

    it("体調が前回と同じ場合に'─ 前回と同じ'が表示されること", () => {
      render(
        <ConditionSelector {...defaultProps} conditionHealth={3} previousConditionHealth={3} />,
      );
      expect(screen.getByText("─ 前回と同じ")).toBeInTheDocument();
    });

    it("体調が前回より下がった場合に'↓ 前回より-2'が表示されること", () => {
      render(
        <ConditionSelector {...defaultProps} conditionHealth={1} previousConditionHealth={3} />,
      );
      expect(screen.getByText("↓ 前回より-2")).toBeInTheDocument();
    });

    it("気分の差分が表示されること", () => {
      render(<ConditionSelector {...defaultProps} conditionMood={5} previousConditionMood={3} />);
      expect(screen.getByText("↑ 前回より+2")).toBeInTheDocument();
    });

    it("業務量の差分が表示されること", () => {
      render(
        <ConditionSelector {...defaultProps} conditionWorkload={2} previousConditionWorkload={4} />,
      );
      expect(screen.getByText("↓ 前回より-2")).toBeInTheDocument();
    });

    it("複数軸に差分がある場合に各々表示されること", () => {
      render(
        <ConditionSelector
          {...defaultProps}
          conditionHealth={4}
          previousConditionHealth={3}
          conditionMood={2}
          previousConditionMood={2}
          conditionWorkload={3}
          previousConditionWorkload={5}
        />,
      );
      expect(screen.getByText("↑ 前回より+1")).toBeInTheDocument();
      expect(screen.getByText("─ 前回と同じ")).toBeInTheDocument();
      expect(screen.getByText("↓ 前回より-2")).toBeInTheDocument();
    });
  });
});
