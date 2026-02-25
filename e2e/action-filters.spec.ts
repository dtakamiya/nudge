import { expect, test } from "@playwright/test";

import { createMeetingFromDetail, createMemberAndNavigateToDetail } from "./helpers";

test.describe("アクションフィルタリング", () => {
  /**
   * テストデータを準備: メンバーとアクションアイテムを作成
   */
  async function setupTestData(page: import("@playwright/test").Page) {
    const memberName = `フィルタテスト_${Date.now()}`;
    const actionTitle = `フィルタ用アクション_${Date.now()}`;

    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, {
      topicTitle: "フィルタテスト話題",
      actionTitle,
    });

    return { memberName, actionTitle };
  }

  /**
   * ステータスフィルターのコンボボックスを取得する
   * ActionFilters の SelectTrigger は w-36 クラスを持つ
   */
  function getStatusFilter(page: import("@playwright/test").Page) {
    return page.locator("main button[role='combobox'].w-36");
  }

  /**
   * メンバーフィルターのコンボボックスを取得する
   * ActionFilters には w-44 の SelectTrigger が2つ（グループ化・メンバー）あるため
   * 2番目（nth(1)）を取得する
   */
  function getMemberFilter(page: import("@playwright/test").Page) {
    return page.locator("main button[role='combobox'].w-44").nth(1);
  }

  test("フィルターUIが表示される", async ({ page }) => {
    await page.goto("/actions");

    // ステータスフィルターが表示される
    await expect(getStatusFilter(page)).toBeVisible();

    // メンバーフィルターが表示される
    await expect(getMemberFilter(page)).toBeVisible();
  });

  test("ステータスフィルターで未着手を選択できる", async ({ page }) => {
    const { actionTitle } = await setupTestData(page);

    await page.goto("/actions");
    await expect(page.getByText(actionTitle)).toBeVisible();

    // ステータスフィルターを開く
    await getStatusFilter(page).click();

    // 未着手を選択
    await page.getByRole("option", { name: "未着手" }).click();

    // URLにステータスパラメータが含まれる
    await expect(page).toHaveURL(/status=TODO/, { timeout: 10000 });

    // 作成したアクションアイテムが表示される（初期状態は未着手）
    await expect(page.getByText(actionTitle)).toBeVisible();
  });

  test("ステータスフィルターで完了を選択すると該当なしの場合がある", async ({ page }) => {
    const { actionTitle } = await setupTestData(page);

    await page.goto("/actions");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(actionTitle)).toBeVisible({ timeout: 10000 });

    // ステータスフィルターを開く
    await getStatusFilter(page).click();

    // 完了を選択
    await page.getByRole("option", { name: "完了" }).click();

    // URLにステータスパラメータが含まれる
    await expect(page).toHaveURL(/status=DONE/, { timeout: 10000 });

    // 新しく作ったアクション（未着手）は表示されない
    await expect(page.getByText(actionTitle)).not.toBeVisible({ timeout: 5000 });
  });

  test("フィルターを「すべて」に戻すと全件表示される", async ({ page }) => {
    const { actionTitle } = await setupTestData(page);

    // まず完了フィルターを適用
    await page.goto("/actions?status=DONE");
    await expect(page.getByText(actionTitle)).not.toBeVisible({ timeout: 5000 });

    // ステータスフィルターを「すべて」に変更
    await getStatusFilter(page).click();
    await page.getByRole("option", { name: "すべて" }).click();

    // フィルターが解除され、アクションが表示される
    await expect(page.getByText(actionTitle)).toBeVisible({ timeout: 10000 });
  });

  test("メンバーフィルターが表示される", async ({ page }) => {
    await setupTestData(page);

    await page.goto("/actions");

    // メンバーフィルターのコンボボックスをクリック
    await getMemberFilter(page).click();

    // 「全メンバー」オプションが表示される
    await expect(page.getByRole("option", { name: "全メンバー" })).toBeVisible();
  });
});
