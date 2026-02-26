import { expect, test } from "@playwright/test";

test.describe("メンバー作成 バリデーション", () => {
  test("名前未入力で送信するとページ遷移しない", async ({ page }) => {
    await page.goto("/members/new");
    await page.getByRole("button", { name: "登録する" }).click();
    // HTML5 required バリデーションによりページ遷移しない
    await expect(page).toHaveURL("/members/new");
  });

  test("名前を空欄でサーバー送信するとエラーメッセージが表示される", async ({ page }) => {
    await page.goto("/members/new");
    // HTML5 required を JS で除去して空のまま送信させる
    await page.locator("input#name").evaluate((el: HTMLInputElement) => {
      el.removeAttribute("required");
    });
    // 名前フィールドを空のまま送信
    await page.getByRole("button", { name: "登録する" }).click();
    // サーバーサイド Zod バリデーションエラーが日本語で表示される
    // Next.js のルートアナウンサーも role="alert" を持つため、p タグに絞り込む
    const alert = page.locator("p[role='alert']");
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText("名前は必須です");
  });
});
