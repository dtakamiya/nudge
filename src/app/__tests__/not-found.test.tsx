import { cleanup,render, screen } from "@testing-library/react";
import { afterEach,describe, expect, it } from "vitest";

import NotFoundPage from "../not-found";

afterEach(() => cleanup());

describe("NotFoundPage", () => {
  it("404 メッセージを表示する", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("ページが見つかりません")).toBeDefined();
    expect(
      screen.getByText("お探しのページは存在しないか、移動した可能性があります。"),
    ).toBeDefined();
  });

  it("ダッシュボードへのリンクを表示する", () => {
    render(<NotFoundPage />);
    const link = screen.getByRole("link", { name: "ダッシュボードに戻る" });
    expect(link.getAttribute("href")).toBe("/");
  });
});
