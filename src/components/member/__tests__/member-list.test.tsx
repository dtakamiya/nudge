import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemberList } from "../member-list";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

const baseMember = {
  id: "member-1",
  name: "田中太郎",
  department: "エンジニアリング",
  position: "シニアエンジニア",
  _count: { actionItems: 3 },
  meetings: [{ date: new Date("2026-02-10") }],
  overdueActionCount: 1,
};

describe("MemberList", () => {
  it("renders empty state when no members", () => {
    render(<MemberList members={[]} />);
    expect(screen.getByText("最初のメンバーを追加しましょう")).toBeDefined();
    expect(screen.getByText("メンバーを追加する")).toBeDefined();
  });

  it("renders member name and department", () => {
    render(<MemberList members={[baseMember]} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("エンジニアリング")).toBeDefined();
  });

  it("renders position as subtext under name", () => {
    render(<MemberList members={[baseMember]} />);
    expect(screen.getByText("シニアエンジニア")).toBeDefined();
  });

  it("renders status badges", () => {
    const recentMember = {
      ...baseMember,
      meetings: [{ date: new Date() }],
    };
    render(<MemberList members={[recentMember]} />);
    expect(screen.getByText("良好")).toBeDefined();
  });

  it("renders 要フォロー badge for members with old meetings", () => {
    const oldMember = {
      ...baseMember,
      meetings: [{ date: new Date("2026-01-01") }],
    };
    render(<MemberList members={[oldMember]} />);
    expect(screen.getByText("要フォロー")).toBeDefined();
  });

  it("renders overdue action count", () => {
    render(<MemberList members={[baseMember]} />);
    expect(screen.getByText(/1件超過/)).toBeDefined();
  });

  it("applies pulse-attention class to 要フォロー badge", () => {
    const oldMember = {
      ...baseMember,
      meetings: [{ date: new Date("2026-01-01") }],
    };
    render(<MemberList members={[oldMember]} />);
    const badge = screen.getByText("要フォロー");
    expect(badge.className).toContain("animate-pulse-attention");
  });

  it("uses shadcn Table components", () => {
    const { container } = render(<MemberList members={[baseMember]} />);
    expect(container.querySelector('[data-slot="table"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-header"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-body"]')).not.toBeNull();
  });

  it("renders rows with role=link", () => {
    render(<MemberList members={[baseMember]} />);
    const rows = screen.getAllByRole("link");
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  describe("aria-sort", () => {
    it("shows aria-sort=ascending on 最終1on1 column by default", () => {
      const { container } = render(<MemberList members={[baseMember]} />);
      const ths = container.querySelectorAll("th");
      const lastMeetingTh = Array.from(ths).find((th) => th.textContent?.includes("最終1on1"));
      expect(lastMeetingTh?.getAttribute("aria-sort")).toBe("ascending");
    });

    it("shows aria-sort=none on 未完了 column by default (not active sort)", () => {
      const { container } = render(<MemberList members={[baseMember]} />);
      const ths = container.querySelectorAll("th");
      const actionsTh = Array.from(ths).find((th) => th.textContent?.includes("未完了"));
      expect(actionsTh?.getAttribute("aria-sort")).toBe("none");
    });

    it("toggles aria-sort to descending when 最終1on1 is clicked", () => {
      const { container } = render(<MemberList members={[baseMember]} />);
      const sortButton = screen.getByRole("button", { name: /最終1on1/ });
      fireEvent.click(sortButton);
      const ths = container.querySelectorAll("th");
      const lastMeetingTh = Array.from(ths).find((th) => th.textContent?.includes("最終1on1"));
      expect(lastMeetingTh?.getAttribute("aria-sort")).toBe("descending");
    });

    it("switches active sort to 未完了 column when its button is clicked", () => {
      const { container } = render(<MemberList members={[baseMember]} />);
      const actionsButton = screen.getByRole("button", { name: /未完了/ });
      fireEvent.click(actionsButton);
      const ths = container.querySelectorAll("th");
      const actionsTh = Array.from(ths).find((th) => th.textContent?.includes("未完了"));
      const lastMeetingTh = Array.from(ths).find((th) => th.textContent?.includes("最終1on1"));
      expect(actionsTh?.getAttribute("aria-sort")).toBe("ascending");
      expect(lastMeetingTh?.getAttribute("aria-sort")).toBe("none");
    });

    it("renders sr-only text for screen readers on active sort column", () => {
      render(<MemberList members={[baseMember]} />);
      expect(screen.getByText("昇順ソート中")).toBeDefined();
    });
  });
});
