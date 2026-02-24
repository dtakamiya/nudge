import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as focusModeModule from "@/hooks/use-focus-mode";

import { MeetingDetailHeader } from "../meeting-detail-header";

// next/link のモック
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// Breadcrumb のモック
vi.mock("@/components/layout/breadcrumb", () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav aria-label="breadcrumb">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}));

// PrintButton のモック
vi.mock("@/components/meeting/print-button", () => ({
  PrintButton: () => <button>印刷 / PDFで保存</button>,
}));

// MeetingHeaderActions のモック
vi.mock("@/components/meeting/meeting-header-actions", () => ({
  MeetingHeaderActions: () => <div data-testid="meeting-header-actions" />,
}));

const defaultProps = {
  memberId: "member-1",
  memberName: "田中太郎",
  meetingId: "meeting-1",
  meetingDate: "2026/02/20",
};

describe("MeetingDetailHeader", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("フォーカスモードOFF時はヘッダーが表示される", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    const wrapper = screen.getByRole("navigation", { name: "breadcrumb" }).closest("div");
    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).not.toContain("opacity-0");
    expect(wrapper?.className).not.toContain("h-0");
  });

  it("フォーカスモードON時はヘッダーが非表示クラスを持つ", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: true,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    // aria-hidden が設定された外側のラッパーを取得
    const hiddenDiv = document.querySelector('[aria-hidden="true"]');
    expect(hiddenDiv).toBeTruthy();
    expect(hiddenDiv?.className).toContain("opacity-0");
    expect(hiddenDiv?.className).toContain("h-0");
    expect(hiddenDiv?.className).toContain("-translate-y-4");
  });

  it("フォーカスモードOFF時は aria-hidden が false になる", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    const div = document.querySelector('[aria-hidden="false"]');
    expect(div).toBeTruthy();
  });

  it("メンバー名と日付がタイトルに表示される", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    expect(screen.getByText("田中太郎との1on1")).toBeInTheDocument();
  });

  it("パンくずリストにメンバー名と日付が含まれる", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    expect(screen.getByText("田中太郎")).toBeInTheDocument();
    expect(screen.getByText("2026/02/20")).toBeInTheDocument();
  });

  it("「戻る」ボタンがメンバー詳細へのリンクを持つ", () => {
    vi.spyOn(focusModeModule, "useFocusMode").mockReturnValue({
      isFocusMode: false,
      toggleFocusMode: vi.fn(),
      setFocusMode: vi.fn(),
    });

    render(<MeetingDetailHeader {...defaultProps} />);

    const backLink = screen.getByRole("link", { name: "戻る" });
    expect(backLink).toHaveAttribute("href", "/members/member-1");
  });
});
