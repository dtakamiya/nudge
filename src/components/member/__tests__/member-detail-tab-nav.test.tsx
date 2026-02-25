import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemberDetailTabNav } from "../member-detail-tab-nav";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const memberId = "member-1";

describe("MemberDetailTabNav", () => {
  it("4つのタブを表示する", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    expect(screen.getByText("タイムライン")).toBeDefined();
    expect(screen.getByText("1on1履歴")).toBeDefined();
    expect(screen.getByText("アクションアイテム")).toBeDefined();
    expect(screen.getByText("目標")).toBeDefined();
  });

  it("タイムラインタブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const timelineLink = screen.getByRole("link", { name: "タイムライン" });
    expect(timelineLink.getAttribute("href")).toBe(`/members/${memberId}?tab=timeline`);
  });

  it("1on1履歴タブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const historyLink = screen.getByRole("link", { name: "1on1履歴" });
    expect(historyLink.getAttribute("href")).toBe(`/members/${memberId}?tab=history`);
  });

  it("アクションアイテムタブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const actionsLink = screen.getByRole("link", { name: "アクションアイテム" });
    expect(actionsLink.getAttribute("href")).toBe(`/members/${memberId}?tab=actions`);
  });

  it("目標タブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const goalsLink = screen.getByRole("link", { name: "目標" });
    expect(goalsLink.getAttribute("href")).toBe(`/members/${memberId}?tab=goals`);
  });

  it("currentTabに応じてアクティブスタイルが適用される", () => {
    const { rerender } = render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const timelineLink = screen.getByRole("link", { name: "タイムライン" });
    expect(timelineLink.className).toContain("bg-");

    rerender(<MemberDetailTabNav memberId={memberId} currentTab="history" />);
    const historyLink = screen.getByRole("link", { name: "1on1履歴" });
    expect(historyLink.className).toContain("bg-");
  });
});
