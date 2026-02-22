import { cleanup,render, screen } from "@testing-library/react";
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
    expect(screen.getByText("メンバーがまだ登録されていません")).toBeDefined();
    expect(screen.getByText("メンバーを追加")).toBeDefined();
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
});
