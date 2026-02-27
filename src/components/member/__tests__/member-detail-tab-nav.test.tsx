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
    role,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    role?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} role={role} {...rest}>
      {children}
    </a>
  ),
}));

const memberId = "member-1";

describe("MemberDetailTabNav", () => {
  it("5つのタブを表示する", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    expect(screen.getByText("タイムライン")).toBeDefined();
    expect(screen.getByText("1on1履歴")).toBeDefined();
    expect(screen.getByText("アクションアイテム")).toBeDefined();
    expect(screen.getByText("目標")).toBeDefined();
    expect(screen.getByText("メモ")).toBeDefined();
  });

  it("タイムラインタブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const timelineTab = screen.getByRole("tab", { name: "タイムライン" });
    expect(timelineTab.getAttribute("href")).toBe(`/members/${memberId}?tab=timeline`);
  });

  it("1on1履歴タブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const historyTab = screen.getByRole("tab", { name: "1on1履歴" });
    expect(historyTab.getAttribute("href")).toBe(`/members/${memberId}?tab=history`);
  });

  it("アクションアイテムタブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const actionsTab = screen.getByRole("tab", { name: "アクションアイテム" });
    expect(actionsTab.getAttribute("href")).toBe(`/members/${memberId}?tab=actions`);
  });

  it("目標タブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const goalsTab = screen.getByRole("tab", { name: "目標" });
    expect(goalsTab.getAttribute("href")).toBe(`/members/${memberId}?tab=goals`);
  });

  it("currentTabに応じてアクティブスタイルが適用される", () => {
    const { rerender } = render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const timelineTab = screen.getByRole("tab", { name: "タイムライン" });
    expect(timelineTab.className).toContain("bg-");

    rerender(<MemberDetailTabNav memberId={memberId} currentTab="history" />);
    const historyTab = screen.getByRole("tab", { name: "1on1履歴" });
    expect(historyTab.className).toContain("bg-");
  });

  it("タブリンクに py-3 クラスが付与されている（タップターゲット44px確保）", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const timelineTab = screen.getByRole("tab", { name: "タイムライン" });
    expect(timelineTab.className).toContain("py-3");
  });

  it("「メモ」タブが表示される", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="notes" />);
    const notesTab = screen.getByRole("tab", { name: "メモ" });
    expect(notesTab).toHaveAttribute("aria-selected", "true");
  });

  it("メモタブのリンクURLが正しい", () => {
    render(<MemberDetailTabNav memberId={memberId} currentTab="timeline" />);
    const notesTab = screen.getByRole("tab", { name: "メモ" });
    expect(notesTab.getAttribute("href")).toBe(`/members/${memberId}?tab=notes`);
  });
});
