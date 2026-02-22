import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MoodSelector } from "../mood-selector";

afterEach(() => {
  cleanup();
});

describe("MoodSelector", () => {
  it("5 つの絵文字ボタンを表示する", () => {
    render(<MoodSelector value={null} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("選択中の mood ボタンに aria-pressed=true が付く", () => {
    render(<MoodSelector value={3} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    // value=3 は 3 番目のボタン（index 2）
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("ボタンをクリックすると onChange が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MoodSelector value={null} onChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[3]); // value=4
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("選択中と同じボタンをクリックすると null で onChange が呼ばれる（トグル）", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MoodSelector value={2} onChange={handleChange} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]); // value=2（現在選択中）
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("各ボタンに aria-label がある", () => {
    render(<MoodSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "とても悪い" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "とても良い" })).toBeInTheDocument();
  });
});
