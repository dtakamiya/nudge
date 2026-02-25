import { cleanup, render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "../empty-state";

afterEach(() => cleanup());

describe("EmptyState", () => {
  it("タイトルを表示する", () => {
    render(<EmptyState icon={Users} title="メンバーがいません" />);
    expect(screen.getByText("メンバーがいません")).toBeDefined();
  });

  it("アイコンを表示する", () => {
    render(<EmptyState icon={Users} title="メンバーがいません" />);
    const icon = document.querySelector("svg");
    expect(icon).not.toBeNull();
  });

  it("説明文を表示する", () => {
    render(
      <EmptyState
        icon={Users}
        title="メンバーがいません"
        description="メンバーを追加してください"
      />,
    );
    expect(screen.getByText("メンバーを追加してください")).toBeDefined();
  });

  it("説明文が未指定の場合は表示しない", () => {
    render(<EmptyState icon={Users} title="メンバーがいません" />);
    expect(screen.queryByText("メンバーを追加してください")).toBeNull();
  });

  it("action が href の場合はリンクボタンを表示する", () => {
    render(
      <EmptyState
        icon={Users}
        title="メンバーがいません"
        action={{ label: "メンバーを追加", href: "/members/new" }}
      />,
    );
    const link = screen.getByRole("link", { name: "メンバーを追加" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/members/new");
  });

  it("size=compact のとき縮小クラスが適用される", () => {
    const { container } = render(<EmptyState icon={Users} title="テスト" size="compact" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("py-6");
  });

  it("size=large のとき大きいクラスが適用される", () => {
    const { container } = render(<EmptyState icon={Users} title="テスト" size="large" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("py-16");
  });

  it("デフォルト（size 未指定）のとき標準クラスが適用される", () => {
    const { container } = render(<EmptyState icon={Users} title="テスト" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("py-10");
  });

  describe("variant", () => {
    it("variant=success のとき data-variant 属性が success になる", () => {
      const { container } = render(<EmptyState icon={Users} title="完了！" variant="success" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute("data-variant")).toBe("success");
    });

    it("variant 未指定のとき data-variant 属性が default になる", () => {
      const { container } = render(<EmptyState icon={Users} title="テスト" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute("data-variant")).toBe("default");
    });
  });

  describe("secondaryAction", () => {
    it("secondaryAction が指定された場合、2つ目のボタンを表示する", () => {
      render(
        <EmptyState
          icon={Users}
          title="テスト"
          action={{ label: "メインアクション", href: "/main" }}
          secondaryAction={{ label: "サブアクション", href: "/sub" }}
        />,
      );
      expect(screen.getByRole("link", { name: "メインアクション" })).toBeDefined();
      expect(screen.getByRole("link", { name: "サブアクション" })).toBeDefined();
    });

    it("secondaryAction 未指定の場合、2つ目のボタンは表示しない", () => {
      render(
        <EmptyState
          icon={Users}
          title="テスト"
          action={{ label: "メインアクション", href: "/main" }}
        />,
      );
      expect(screen.queryByRole("link", { name: "サブアクション" })).toBeNull();
    });
  });
});
