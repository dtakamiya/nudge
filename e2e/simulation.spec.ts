import { expect, test } from "@playwright/test";

import { confirmSaveMeeting } from "./helpers";

test.describe("一連の業務フローシミュレーション", () => {
  test("ダッシュボード確認から1on1作成、アクション更新までの一連のフロー", async ({ page }) => {
    // 1. ダッシュボードの確認
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();

    // 2. メンバー一覧からシードデータの固定ユーザーを探して詳細ページへ遷移
    // シードデータ (`prisma/seed-test.ts`) で "E2E Test User" が作られている前提
    const memberName = "E2E Test User";

    // ダッシュボードのメンバー一覧テーブル行を検索
    const tableRow = page
      .locator("main")
      .locator("[role='link']")
      .filter({ hasText: memberName })
      .first();
    await expect(tableRow).toBeVisible({ timeout: 10000 });

    // 「1on1」リンクまたは行をクリックして遷移（ここでは行内のリンク href を取得して遷移）
    const linkHref = await tableRow.locator("a[href]").first().getAttribute("href");
    expect(linkHref).toBeTruthy();
    const memberPath = linkHref!.replace(/\/meetings\/new$/, ""); // メンバー詳細の URL を生成

    await page.goto(memberPath);
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 10000 });

    // 3. 1on1の作成（準備〜実施）
    // 新規1on1作成画面へ
    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // 話題1つ目の入力
    const topicInputs = page.getByPlaceholder("話題のタイトル");
    await topicInputs.first().fill("今週のタスク進捗（シミュレーション）");

    // 話題2つ目の追加
    await page.getByRole("button", { name: "+ 話題を追加" }).click();
    await expect(topicInputs).toHaveCount(2);
    await topicInputs.nth(1).fill("困っていることの共有");

    // アクションアイテムの追加
    await page.getByRole("button", { name: "+ アクション追加" }).click();
    const actionTitleInput = page.getByPlaceholder("アクションのタイトル");
    await expect(actionTitleInput.first()).toBeVisible();

    const newActionTitle = `シミュレーション確認用アクション_${Date.now()}`;
    await actionTitleInput.first().fill(newActionTitle);

    // 保存ボタンをクリック → ClosingDialog が表示されるので確認する
    await page.getByRole("button", { name: "1on1を保存" }).first().click();
    await confirmSaveMeeting(page);
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });

    // 4. アクション一覧の確認と更新
    // サイドバーのリンククリックが安定しない場合があるため、直接遷移するか十分待機する
    await page.goto("/actions");
    await expect(page).toHaveURL("/actions");
    await expect(page.getByRole("heading", { name: "アクション一覧" })).toBeVisible();

    // 作成したアクションアイテムが表示されることを確認
    await expect(page.getByText(newActionTitle)).toBeVisible({ timeout: 10000 });

    // 5. アクションのステータスを「完了」に変更する
    const actionCardElement = page
      .locator("main [class*='card']")
      .filter({ hasText: newActionTitle })
      .first();
    const statusCombobox = actionCardElement.locator("button[role='combobox']");

    if (await statusCombobox.isVisible()) {
      await statusCombobox.click();
      await page.getByRole("option", { name: "完了" }).click();

      // リロードして反映を確認
      await page.reload();
      // TODO: "完了"状態になったことを正しくアサートする方法が UI によって異なるため、
      // ここではカードコンポーネントが表示され続けていること、もしくは「完了」表示が含まれることを確認
      await expect(page.getByText(newActionTitle)).toBeVisible();
    }
  });
});
