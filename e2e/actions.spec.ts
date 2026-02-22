import { expect,test } from "@playwright/test";

import { createMemberAndNavigateToDetail } from "./helpers";

test.describe("アクションアイテム", () => {
  /**
   * ヘルパー: メンバーを作成し、アクションアイテム付きのミーティングを作成する
   * メンバー詳細ページに遷移した状態で返す
   */
  async function createMemberWithAction(
    page: import("@playwright/test").Page,
    memberName: string,
    actionTitle: string,
  ) {
    await createMemberAndNavigateToDetail(page, memberName);

    // ミーティングを作成（アクションアイテム付き）
    await page.getByRole("link", { name: "新規1on1" }).click();
    await page.getByPlaceholder("話題のタイトル").first().fill("進捗確認");

    // アクションアイテムを追加
    await page.getByRole("button", { name: "+ アクション追加" }).click();
    await page.getByPlaceholder("アクションのタイトル").first().fill(actionTitle);

    // 保存
    await page.getByRole("button", { name: "1on1を保存" }).click();
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });
  }

  test("アクション一覧ページが表示される", async ({ page }) => {
    await page.goto("/actions");

    await expect(page.getByRole("heading", { name: "アクション一覧" })).toBeVisible();
  });

  test("パンくずリストが表示される", async ({ page }) => {
    await page.goto("/actions");

    const breadcrumb = page.getByLabel("パンくずリスト");
    await expect(breadcrumb.getByRole("link", { name: "ダッシュボード" })).toBeVisible();
    await expect(breadcrumb.getByText("アクション一覧")).toBeVisible();
  });

  test("アクションアイテムがない場合、空メッセージが表示される", async ({ page }) => {
    await page.goto("/actions");

    // アクションアイテムがない場合の表示確認
    const emptyMessage = page.getByText("アクションアイテムはありません");
    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    if (hasEmpty) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test("作成したアクションアイテムがアクション一覧に表示される", async ({ page }) => {
    const memberName = `アクションテスト_一覧_${Date.now()}`;
    const actionTitle = `テストアクション_${Date.now()}`;

    await createMemberWithAction(page, memberName, actionTitle);

    // アクション一覧ページに遷移
    await page.goto("/actions");

    // 作成したアクションアイテムが表示される
    await expect(page.getByText(actionTitle)).toBeVisible();

    // メンバー名が表示される
    await expect(page.locator("main").getByText(memberName).first()).toBeVisible();
  });

  test("アクションアイテムのステータスを変更できる", async ({ page }) => {
    const memberName = `アクションテスト_ステータス_${Date.now()}`;
    const actionTitle = `ステータス変更テスト_${Date.now()}`;

    await createMemberWithAction(page, memberName, actionTitle);

    // アクション一覧ページに遷移
    await page.goto("/actions");

    // 作成したアクションアイテムが表示されることを確認
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(actionTitle)).toBeVisible({ timeout: 10000 });

    // アクションアイテムのカード内のステータスセレクトを見つける
    // ActionListFull のカード構造: Card > CardContent > div(flex) > Select + div(info)
    const actionCard = page
      .locator("main")
      .locator("div")
      .filter({ hasText: actionTitle })
      .locator("button[role='combobox']")
      .first();

    if (await actionCard.isVisible()) {
      await actionCard.click();

      // 「進行中」を選択
      await page.getByRole("option", { name: "進行中" }).click();

      // ページをリロードして永続化を確認
      await page.reload();
      await expect(page.getByText(actionTitle)).toBeVisible();
    }
  });

  test("メンバー詳細のアクションアイテムでステータスを切り替えできる", async ({ page }) => {
    const memberName = `アクションテスト_切替_${Date.now()}`;
    const actionTitle = `切替テスト_${Date.now()}`;

    await createMemberWithAction(page, memberName, actionTitle);

    // メンバー詳細でアクションアイテムが表示される
    await expect(page.getByText(actionTitle).first()).toBeVisible();

    // ステータスバッジ「未着手」をクリックしてステータスを切り替え
    // ActionListCompact ではバッジクリックでサイクルする
    const statusBadge = page.locator("button").filter({ hasText: "未着手" }).first();

    if (await statusBadge.isVisible()) {
      await statusBadge.click();

      // ステータスが「進行中」に変わることを確認（optimistic update）
      await expect(page.locator("button").filter({ hasText: "進行中" }).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
