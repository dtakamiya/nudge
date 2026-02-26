import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

  describe("truncate 対応", () => {
    it("メンバー名の span に truncate クラスが付与されている", () => {
      const longNameMember = {
        ...baseMember,
        name: "とても長いメンバー名前フルネームテスト用データ",
      };
      render(<MemberList members={[longNameMember]} />);

      const nameSpan = screen.getByText(longNameMember.name);
      expect(nameSpan.className).toContain("truncate");
    });

    it("メンバー名の span に title 属性が設定されている", () => {
      const longNameMember = {
        ...baseMember,
        name: "とても長いメンバー名前フルネームテスト用データ",
      };
      render(<MemberList members={[longNameMember]} />);

      const nameSpan = screen.getByText(longNameMember.name);
      expect(nameSpan.getAttribute("title")).toBe(longNameMember.name);
    });

    it("役職に truncate クラスが付与されている", () => {
      const longPositionMember = {
        ...baseMember,
        position: "非常に長い役職名テスト用データシニアプリンシパルエンジニア",
      };
      render(<MemberList members={[longPositionMember]} />);

      const positionEl = screen.getByText(longPositionMember.position);
      expect(positionEl.className).toContain("truncate");
    });

    it("役職に title 属性が設定されている", () => {
      const longPositionMember = {
        ...baseMember,
        position: "非常に長い役職名テスト用データシニアプリンシパルエンジニア",
      };
      render(<MemberList members={[longPositionMember]} />);

      const positionEl = screen.getByText(longPositionMember.position);
      expect(positionEl.getAttribute("title")).toBe(longPositionMember.position);
    });

    it("部署に truncate クラスが付与されている", () => {
      const longDeptMember = {
        ...baseMember,
        department: "とても長い部署名テスト用データプロダクトエンジニアリング部門",
      };
      render(<MemberList members={[longDeptMember]} />);

      const deptEl = screen.getByText(longDeptMember.department);
      expect(deptEl.className).toContain("truncate");
    });

    it("部署に title 属性が設定されている", () => {
      const longDeptMember = {
        ...baseMember,
        department: "とても長い部署名テスト用データプロダクトエンジニアリング部門",
      };
      render(<MemberList members={[longDeptMember]} />);

      const deptEl = screen.getByText(longDeptMember.department);
      expect(deptEl.getAttribute("title")).toBe(longDeptMember.department);
    });
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

  it("1on1ボタンが size=sm である（タップターゲット確保）", () => {
    render(<MemberList members={[baseMember]} />);
    const linkEl = screen.getAllByRole("link").find((el) => el.textContent?.trim() === "1on1");
    expect(linkEl).toBeDefined();
    const buttonEl = linkEl?.querySelector("[data-size]");
    expect(buttonEl?.getAttribute("data-size")).toBe("sm");
  });

  it("テーブルラッパーに overflow-x-auto が付与されている（横スクロール対応）", () => {
    const { container } = render(<MemberList members={[baseMember]} />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("overflow-x-auto");
  });

  describe("スナップショット", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-02-26T00:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("空リストのスナップショット", () => {
      const { asFragment } = render(<MemberList members={[]} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("メンバーあり（良好ステータス）のスナップショット", () => {
      const member = {
        ...baseMember,
        meetings: [{ date: new Date("2026-02-20") }],
        overdueActionCount: 0,
      };
      const { asFragment } = render(<MemberList members={[member]} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("複数メンバー（良好・要フォロー混在）のスナップショット", () => {
      const recentMember = {
        ...baseMember,
        id: "member-1",
        name: "田中 太郎",
        meetings: [{ date: new Date("2026-02-20") }],
        overdueActionCount: 0,
      };
      const oldMember = {
        ...baseMember,
        id: "member-2",
        name: "佐藤 花子",
        department: "デザイン",
        position: "デザイナー",
        meetings: [{ date: new Date("2026-01-01") }],
        overdueActionCount: 2,
      };
      const { asFragment } = render(<MemberList members={[recentMember, oldMember]} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
