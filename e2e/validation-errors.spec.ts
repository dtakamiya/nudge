import { expect, test } from "@playwright/test";

import { confirmSaveMeeting, createMemberAndNavigateToDetail } from "./helpers";

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

test.describe("ミーティング作成 バリデーション", () => {
  test("日付フィールドに required 属性があることを確認する", async ({ page }) => {
    const memberName = `バリデーションテスト_日付_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ページに遷移
    await page.getByRole("link", { name: "新規1on1" }).click();
    await page.waitForURL(/\/meetings\/new$/, { timeout: 15000 });
    await expect(page.getByLabel("日付 *")).toBeVisible({ timeout: 10000 });

    // 日付フィールドに required 属性があることを確認
    const dateInput = page.locator("input#date");
    await expect(dateInput).toHaveAttribute("required");
  });

  test("日付をクリアして保存するとエラーアラートが表示される", async ({ page }) => {
    const memberName = `バリデーションテスト_日付クリア_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ページに遷移
    await page.getByRole("link", { name: "新規1on1" }).click();
    await page.waitForURL(/\/meetings\/new$/, { timeout: 15000 });
    await expect(page.getByLabel("日付 *")).toBeVisible({ timeout: 10000 });

    // React の onChange 経由で日付を空にする + required 除去
    await page.locator("input#date").evaluate((el) => {
      if (el instanceof HTMLInputElement) {
        const nativeInputSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputSetter?.call(el, "");
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.removeAttribute("required");
      }
    });

    // 「1on1を保存」をクリック → ClosingDialog が表示される
    await page.getByRole("button", { name: "1on1を保存" }).first().click();
    await confirmSaveMeeting(page);

    // エラーアラートが表示されること（日付が無効なため）
    await expect(page.locator("form").getByRole("alert")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("アクションアイテム ステータスサイクル", () => {
  test("ステータスが TODO → 進行中 → 完了 と遷移できる", async ({ page }) => {
    const memberName = `ステータスサイクル_${Date.now()}`;
    const actionTitle = `サイクルテスト_${Date.now()}`;

    // メンバーとアクションアイテム付きミーティングを作成
    await createMemberAndNavigateToDetail(page, memberName);
    await page.getByRole("link", { name: "新規1on1" }).click();
    await page.getByPlaceholder("話題のタイトル").first().fill("ステータステスト");
    await page.getByRole("button", { name: "+ アクション追加" }).click();
    await page.getByPlaceholder("アクションのタイトル").first().fill(actionTitle);
    await page.getByRole("button", { name: "1on1を保存" }).first().click();
    await confirmSaveMeeting(page);
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({
      timeout: 15000,
    });

    // 初期状態: 「未着手」が表示される
    const statusBadge = page.locator("button").filter({ hasText: "未着手" }).first();
    await expect(statusBadge).toBeVisible({ timeout: 5000 });

    // TODO → 進行中
    await statusBadge.click();
    const inProgressBadge = page.locator("button").filter({ hasText: "進行中" }).first();
    await expect(inProgressBadge).toBeVisible({ timeout: 5000 });

    // 進行中 → 完了
    await inProgressBadge.click();
    const doneBadge = page.locator("button").filter({ hasText: "完了" }).first();
    await expect(doneBadge).toBeVisible({ timeout: 5000 });
  });
});
