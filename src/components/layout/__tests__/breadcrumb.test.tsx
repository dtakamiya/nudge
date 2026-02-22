import { cleanup,render, screen } from "@testing-library/react";
import { afterEach,describe, expect, it } from "vitest";

import { Breadcrumb } from "../breadcrumb";

afterEach(() => {
  cleanup();
});

describe("Breadcrumb - アクセシビリティ", () => {
  it("nav に aria-label='パンくずリスト' が設定されている", () => {
    render(<Breadcrumb items={[{ label: "ホーム" }]} />);
    expect(screen.getByRole("navigation", { name: "パンくずリスト" })).toBeDefined();
  });
});

describe("Breadcrumb - 基本表示", () => {
  it("空配列でもクラッシュせずレンダーされる", () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByRole("navigation")).toBeDefined();
  });

  it("アイテムのラベルが表示される", () => {
    render(<Breadcrumb items={[{ label: "ホーム" }]} />);
    expect(screen.getByText("ホーム")).toBeDefined();
  });

  it("複数アイテム全てのラベルが表示される", () => {
    render(
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "メンバー", href: "/members" },
          { label: "田中太郎" },
        ]}
      />,
    );
    expect(screen.getByText("ホーム")).toBeDefined();
    expect(screen.getByText("メンバー")).toBeDefined();
    expect(screen.getByText("田中太郎")).toBeDefined();
  });
});

describe("Breadcrumb - リンク表示", () => {
  it("href があるアイテムはリンク（<a>）としてレンダーされる", () => {
    render(<Breadcrumb items={[{ label: "ホーム", href: "/" }]} />);
    const link = screen.getByRole("link", { name: "ホーム" });
    expect(link).toBeDefined();
  });

  it("リンクの href 属性が正しい値を持つ", () => {
    render(<Breadcrumb items={[{ label: "メンバー", href: "/members" }]} />);
    const link = screen.getByRole("link", { name: "メンバー" });
    expect(link.getAttribute("href")).toBe("/members");
  });

  it("href がないアイテムはリンクではなくテキストとしてレンダーされる", () => {
    render(<Breadcrumb items={[{ label: "田中太郎" }]} />);
    expect(screen.queryByRole("link", { name: "田中太郎" })).toBeNull();
    expect(screen.getByText("田中太郎")).toBeDefined();
  });
});

describe("Breadcrumb - セパレーター", () => {
  it("アイテムが1つのときセパレーターが表示されない", () => {
    const { container } = render(<Breadcrumb items={[{ label: "ホーム" }]} />);
    expect(container.querySelectorAll("svg").length).toBe(0);
  });

  it("アイテムが2つのとき SVG セパレーターが1つ表示される", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "メンバー" }]} />,
    );
    expect(container.querySelectorAll("svg").length).toBe(1);
  });

  it("アイテムが3つのとき SVG セパレーターが2つ表示される", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "メンバー", href: "/members" },
          { label: "田中太郎" },
        ]}
      />,
    );
    expect(container.querySelectorAll("svg").length).toBe(2);
  });
});
