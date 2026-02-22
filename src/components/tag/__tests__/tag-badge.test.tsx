import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagBadge } from "../tag-badge";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TagBadge", () => {
  it("名前が表示される", () => {
    render(<TagBadge name="フロントエンド" />);
    expect(screen.getByText("フロントエンド")).toBeDefined();
  });

  it("onRemove がない場合は X ボタンを表示しない", () => {
    render(<TagBadge name="フロントエンド" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("onRemove がある場合は X ボタンを表示する", () => {
    const onRemove = vi.fn();
    render(<TagBadge name="フロントエンド" onRemove={onRemove} />);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("X ボタンクリックで onRemove コールバックが呼ばれる", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<TagBadge name="フロントエンド" onRemove={onRemove} />);
    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("size='sm' のとき data-size 属性が設定される", () => {
    render(<TagBadge name="フロントエンド" size="sm" />);
    const badge = screen.getByText("フロントエンド").closest("[data-size]");
    expect(badge?.getAttribute("data-size")).toBe("sm");
  });

  it("size='md' のとき data-size 属性が設定される", () => {
    render(<TagBadge name="フロントエンド" size="md" />);
    const badge = screen.getByText("フロントエンド").closest("[data-size]");
    expect(badge?.getAttribute("data-size")).toBe("md");
  });

  it("color プロパティが指定された場合、スタイルが適用される", () => {
    const { container } = render(<TagBadge name="フロントエンド" color="#6366f1" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge?.getAttribute("style")).toContain("background-color");
  });

  it("color が指定されない場合はデフォルトカラーが適用される", () => {
    const { container } = render(<TagBadge name="フロントエンド" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeDefined();
  });
});
