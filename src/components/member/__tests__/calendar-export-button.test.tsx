import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarExportButton } from "../calendar-export-button";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CalendarExportButton", () => {
  it("次回予定日がある場合、ボタンを有効状態で表示する", () => {
    render(
      <CalendarExportButton memberName="田中 太郎" nextMeetingDate={new Date("2026-03-15")} />,
    );
    const button = screen.getByRole("button", { name: /カレンダーに追加/ });
    expect(button).toBeDefined();
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("次回予定日が null の場合、ボタンを disabled で表示する", () => {
    render(<CalendarExportButton memberName="田中 太郎" nextMeetingDate={null} />);
    const button = screen.getByRole("button", { name: /カレンダーに追加/ });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("ボタンテキストに「カレンダーに追加」が含まれる", () => {
    render(
      <CalendarExportButton memberName="田中 太郎" nextMeetingDate={new Date("2026-03-15")} />,
    );
    expect(screen.getByText(/カレンダーに追加/)).toBeDefined();
  });
});
