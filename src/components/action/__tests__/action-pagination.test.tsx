import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ActionPagination } from "../action-pagination";

afterEach(() => {
  cleanup();
});

describe("ActionPagination", () => {
  it("totalPages が 1 のとき何も表示しない", () => {
    const { container } = render(
      <ActionPagination currentPage={1} totalPages={1} searchParams={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("totalPages が 0 のとき何も表示しない", () => {
    const { container } = render(
      <ActionPagination currentPage={1} totalPages={0} searchParams={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("複数ページのとき前へ・次へボタンが表示される", () => {
    render(<ActionPagination currentPage={2} totalPages={3} searchParams={{}} />);
    expect(screen.getByRole("link", { name: "前のページ" })).toBeDefined();
    expect(screen.getByRole("link", { name: "次のページ" })).toBeDefined();
  });

  it("1ページ目のとき前へボタンが無効", () => {
    render(<ActionPagination currentPage={1} totalPages={3} searchParams={{}} />);
    expect(screen.queryByRole("link", { name: "前のページ" })).toBeNull();
  });

  it("最終ページのとき次へボタンが無効", () => {
    render(<ActionPagination currentPage={3} totalPages={3} searchParams={{}} />);
    expect(screen.queryByRole("link", { name: "次のページ" })).toBeNull();
  });

  it("7ページ以下のとき全ページ番号が表示される", () => {
    render(<ActionPagination currentPage={1} totalPages={5} searchParams={{}} />);
    expect(screen.getByRole("link", { name: "2ページ目" })).toBeDefined();
    expect(screen.getByRole("link", { name: "5ページ目" })).toBeDefined();
  });

  it("現在のページ番号はリンクでなくボタン表示", () => {
    render(<ActionPagination currentPage={2} totalPages={5} searchParams={{}} />);
    // 現在ページ (2) はリンクではなくボタン表示
    const currentPageBtn = screen.getByText("2");
    expect(currentPageBtn.closest("a")).toBeNull();
  });

  it("8ページ以上のとき省略記号が表示される", () => {
    render(<ActionPagination currentPage={5} totalPages={10} searchParams={{}} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("前へリンクが正しいURLを持つ", () => {
    render(<ActionPagination currentPage={3} totalPages={5} searchParams={{}} />);
    const prevLink = screen.getByRole("link", { name: "前のページ" });
    expect(prevLink.getAttribute("href")).toBe("/actions?page=2");
  });

  it("次へリンクが正しいURLを持つ", () => {
    render(<ActionPagination currentPage={2} totalPages={5} searchParams={{}} />);
    const nextLink = screen.getByRole("link", { name: "次のページ" });
    expect(nextLink.getAttribute("href")).toBe("/actions?page=3");
  });

  it("フィルターパラメータがURLに引き継がれる", () => {
    render(
      <ActionPagination
        currentPage={1}
        totalPages={3}
        searchParams={{ status: "TODO", sort: "dueDate" }}
      />,
    );
    const nextLink = screen.getByRole("link", { name: "次のページ" });
    const href = nextLink.getAttribute("href") ?? "";
    expect(href).toContain("status=TODO");
    expect(href).toContain("sort=dueDate");
    expect(href).toContain("page=2");
  });
});
