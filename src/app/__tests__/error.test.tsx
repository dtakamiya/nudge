import { cleanup,render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach,describe, expect, it, vi } from "vitest";

import ErrorPage from "../error";

afterEach(() => cleanup());

describe("ErrorPage", () => {
  it("エラーメッセージを表示する", () => {
    const error = new Error("テストエラー");
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText("エラーが発生しました")).toBeDefined();
    expect(screen.getByText("テストエラー")).toBeDefined();
  });

  it("エラーメッセージが空の場合はデフォルトメッセージを表示する", () => {
    const error = new Error("");
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText("予期しないエラーが発生しました。")).toBeDefined();
  });

  it("「もう一度試す」ボタンで reset が呼ばれる", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error("エラー")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: "もう一度試す" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
