import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StarRating } from "../star-rating";

describe("StarRating", () => {
  it("5つの星ボタンを表示する", () => {
    render(<StarRating value={null} onChange={vi.fn()} label="満足度" />);
    const buttons = screen.getAllByRole("radio");
    expect(buttons).toHaveLength(5);
  });

  it("value に応じた星が選択状態になる", () => {
    render(<StarRating value={3} onChange={vi.fn()} label="満足度" />);
    const buttons = screen.getAllByRole("radio");
    expect(buttons[0]).toHaveAttribute("aria-checked", "true");
    expect(buttons[1]).toHaveAttribute("aria-checked", "true");
    expect(buttons[2]).toHaveAttribute("aria-checked", "true");
    expect(buttons[3]).toHaveAttribute("aria-checked", "false");
    expect(buttons[4]).toHaveAttribute("aria-checked", "false");
  });

  it("星をクリックすると onChange が呼ばれる", () => {
    const onChange = vi.fn();
    render(<StarRating value={null} onChange={onChange} label="満足度" />);
    const buttons = screen.getAllByRole("radio");
    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("同じ値をクリックすると null にリセットされる", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} label="満足度" />);
    const buttons = screen.getAllByRole("radio");
    fireEvent.click(buttons[2]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("aria-label が設定されている", () => {
    render(<StarRating value={null} onChange={vi.fn()} label="満足度" />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-label", "満足度");
  });
});
