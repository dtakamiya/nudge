import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CHECKIN_MESSAGES } from "@/lib/checkin-messages";

import { CheckinSection } from "../checkin-section";

afterEach(() => {
  cleanup();
});

describe("CheckinSection", () => {
  const defaultProps = {
    conditionHealth: null,
    conditionMood: null,
    conditionWorkload: null,
    checkinNote: "",
    onConditionChange: vi.fn(),
    onCheckinNoteChange: vi.fn(),
  };

  it("セクションがレンダリングされること", () => {
    render(<CheckinSection {...defaultProps} />);
    expect(screen.getByText(/チェックイン/)).toBeInTheDocument();
  });

  it("ConditionSelector が含まれること（体調・気分・業務量が表示）", () => {
    render(<CheckinSection {...defaultProps} />);
    expect(screen.getByText(/体調/)).toBeInTheDocument();
    expect(screen.getByText(/気分/)).toBeInTheDocument();
    expect(screen.getByText(/業務量/)).toBeInTheDocument();
  });

  it("IcebreakerCard が含まれること（別の話題ボタンが表示）", () => {
    render(<CheckinSection {...defaultProps} />);
    expect(screen.getByRole("button", { name: /別の話題/ })).toBeInTheDocument();
  });

  it("checkinNote の textarea が表示されること", () => {
    render(<CheckinSection {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("textarea に初期値が表示されること", () => {
    render(<CheckinSection {...defaultProps} checkinNote="テストメモ" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("テストメモ");
  });

  it("textarea を入力すると onCheckinNoteChange が呼ばれること", async () => {
    const user = userEvent.setup();
    const handleNoteChange = vi.fn();
    render(<CheckinSection {...defaultProps} onCheckinNoteChange={handleNoteChange} />);
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "テスト入力");
    expect(handleNoteChange).toHaveBeenCalled();
  });

  it("心理的安全性メッセージが表示されること", () => {
    render(<CheckinSection {...defaultProps} />);
    // CHECKIN_MESSAGES のいずれかが表示されること
    const textContent = document.body.textContent ?? "";
    const hasMessage = CHECKIN_MESSAGES.some((msg) => textContent.includes(msg));
    expect(hasMessage).toBe(true);
  });
});
