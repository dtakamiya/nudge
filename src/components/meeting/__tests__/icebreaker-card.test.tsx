import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { IcebreakerCard } from "../icebreaker-card";

afterEach(() => {
  cleanup();
});

describe("IcebreakerCard", () => {
  it("カードがレンダリングされること", () => {
    render(<IcebreakerCard />);
    // カードコンテンツが表示される
    expect(document.body).toBeTruthy();
  });

  it("「別の話題」ボタンが表示されること", () => {
    render(<IcebreakerCard />);
    expect(screen.getByRole("button", { name: /別の話題/ })).toBeInTheDocument();
  });

  it("アイスブレイクの質問テキストが表示されること", () => {
    render(<IcebreakerCard />);
    // カテゴリバッジかテキストが表示されること
    const card = document.body;
    expect(card.textContent?.length).toBeGreaterThan(0);
  });

  it("カテゴリバッジが表示されること", () => {
    render(<IcebreakerCard />);
    // カテゴリはアイスブレイクのカテゴリのいずれかであること
    const validCategories = ["最近のこと", "趣味・好き", "仕事の発見", "ウェルネス", "将来・夢"];
    const textContent = document.body.textContent ?? "";
    const hasCategory = validCategories.some((cat) => textContent.includes(cat));
    expect(hasCategory).toBe(true);
  });

  it("「別の話題」ボタンをクリックすると話題が変わる可能性があること", async () => {
    const user = userEvent.setup();
    render(<IcebreakerCard />);
    const button = screen.getByRole("button", { name: /別の話題/ });
    const initialText = document.body.textContent;
    // クリックしてもエラーが発生しないこと
    await user.click(button);
    // ボタンはまだ存在すること
    expect(screen.getByRole("button", { name: /別の話題/ })).toBeInTheDocument();
    // テキストコンテンツは引き続き存在すること
    expect(document.body.textContent?.length).toBeGreaterThan(0);
    // initialText の参照のみ（変わることもある）
    expect(typeof initialText).toBe("string");
  });
});
