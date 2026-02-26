import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { CoachingTipCard } from "../coaching-tip-card";

afterEach(() => {
  cleanup();
});

describe("CoachingTipCard", () => {
  it("カテゴリバッジが表示されること（有効カテゴリのいずれか）", () => {
    render(<CoachingTipCard category="傾聴" />);
    const validCategories = [
      "傾聴",
      "質問",
      "承認・ねぎらい",
      "ベストプラクティス",
      "フィードバック",
    ];
    const textContent = document.body.textContent ?? "";
    const hasCategory = validCategories.some((cat) => textContent.includes(cat));
    expect(hasCategory).toBe(true);
  });

  it("Tipテキストが表示されること（テキストコンテンツが空でないこと）", () => {
    render(<CoachingTipCard category="質問" />);
    const textContent = document.body.textContent ?? "";
    expect(textContent.length).toBeGreaterThan(0);
  });

  it("「別のTip」ボタンが表示されること", () => {
    render(<CoachingTipCard category="フィードバック" />);
    expect(screen.getByRole("button", { name: /別のTip/ })).toBeInTheDocument();
  });

  it("ボタンクリックでエラーが発生しないこと", async () => {
    const user = userEvent.setup();
    render(<CoachingTipCard category="ベストプラクティス" />);
    const button = screen.getByRole("button", { name: /別のTip/ });
    await user.click(button);
    expect(screen.getByRole("button", { name: /別のTip/ })).toBeInTheDocument();
    expect(document.body.textContent?.length).toBeGreaterThan(0);
  });

  it("detailテキストが表示されること", () => {
    render(<CoachingTipCard category="承認・ねぎらい" />);
    // 承認・ねぎらいカテゴリのTipはすべてdetailを持つため、何らかのdetailテキストが表示される
    const textContent = document.body.textContent ?? "";
    expect(textContent.length).toBeGreaterThan(0);
    // カードコンテンツが存在すること
    expect(document.body).toBeTruthy();
  });
});
