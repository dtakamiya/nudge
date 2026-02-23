import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ActionPagination } from "../action-pagination";

afterEach(() => {
  cleanup();
});

const buildPageUrl = (page: number) => `/actions?page=${page}`;

describe("ActionPagination", () => {
  it("totalPages が 1 のとき何も表示しない", () => {
    const { container } = render(
      <ActionPagination currentPage={1} totalPages={1} buildPageUrl={buildPageUrl} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("totalPages が 0 のとき何も表示しない", () => {
    const { container } = render(
      <ActionPagination currentPage={1} totalPages={0} buildPageUrl={buildPageUrl} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("複数ページのとき前へ・次へボタンが表示される", () => {
    render(<ActionPagination currentPage={2} totalPages={3} buildPageUrl={buildPageUrl} />);
    expect(screen.getByRole("link", { name: "前のページ" })).toBeDefined();
    expect(screen.getByRole("link", { name: "次のページ" })).toBeDefined();
  });

  it("1ページ目のとき前へボタンが無効", () => {
    render(<ActionPagination currentPage={1} totalPages={3} buildPageUrl={buildPageUrl} />);
    expect(screen.queryByRole("link", { name: "前のページ" })).toBeNull();
  });

  it("最終ページのとき次へボタンが無効", () => {
    render(<ActionPagination currentPage={3} totalPages={3} buildPageUrl={buildPageUrl} />);
    expect(screen.queryByRole("link", { name: "次のページ" })).toBeNull();
  });

  it("7ページ以下のとき全ページ番号が表示される", () => {
    render(<ActionPagination currentPage={1} totalPages={5} buildPageUrl={buildPageUrl} />);
    expect(screen.getByRole("link", { name: "2ページ目" })).toBeDefined();
    expect(screen.getByRole("link", { name: "5ページ目" })).toBeDefined();
  });

  it("現在のページ番号はリンクでなくボタン表示", () => {
    render(<ActionPagination currentPage={2} totalPages={5} buildPageUrl={buildPageUrl} />);
    // 現在ページ (2) はリンクではなくボタン表示
    const currentPageBtn = screen.getByText("2");
    expect(currentPageBtn.closest("a")).toBeNull();
  });

  it("8ページ以上のとき省略記号が表示される", () => {
    render(<ActionPagination currentPage={5} totalPages={10} buildPageUrl={buildPageUrl} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("前へリンクが正しいURLを持つ", () => {
    render(<ActionPagination currentPage={3} totalPages={5} buildPageUrl={buildPageUrl} />);
    const prevLink = screen.getByRole("link", { name: "前のページ" });
    expect(prevLink.getAttribute("href")).toBe("/actions?page=2");
  });

  it("次へリンクが正しいURLを持つ", () => {
    render(<ActionPagination currentPage={2} totalPages={5} buildPageUrl={buildPageUrl} />);
    const nextLink = screen.getByRole("link", { name: "次のページ" });
    expect(nextLink.getAttribute("href")).toBe("/actions?page=3");
  });
});
