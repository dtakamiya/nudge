import { expect, test } from "@playwright/test";

test.describe("メンバー作成 バリデーション", () => {
  test("名前未入力で送信するとページ遷移しない", async ({ page }) => {
    await page.goto("/members/new");

    // 名前を入力せずに送信（HTML5 required バリデーションでクライアント側ブロック）
    await page.getByRole("button", { name: "登録する" }).click();

    // HTML5 required バリデーションによりページ遷移しない
    await expect(page).toHaveURL("/members/new");
  });

  test("名前を空欄でサーバー送信すると日本語バリデーションエラーが表示される", async ({ page }) => {
    await page.goto("/members/new");

    // HTML5 required を JS で除去してサーバーサイドバリデーションを検証
    await page.locator("input#name").evaluate((el) => {
      if (el instanceof HTMLInputElement) {
        el.removeAttribute("required");
      }
    });

    // 名前フィールドを空のまま送信
    await page.getByRole("button", { name: "登録する" }).click();

    // サーバーサイド Zod バリデーションエラーが日本語で表示される
    // form 内の alert に絞り込み、Next.js ルートアナウンサーと区別する
    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText("名前は必須です");
  });
});
