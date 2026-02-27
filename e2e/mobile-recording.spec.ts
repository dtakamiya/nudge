import { expect, test } from "@playwright/test";

import { createMemberAndNavigateToDetail } from "./helpers";

// モバイルビューポート設定
test.use({ viewport: { width: 375, height: 667 } });

test.describe("モバイル記録画面", () => {
  test("FABボタンが表示される", async ({ page }) => {
    const memberName = `モバイル_FAB_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ボタンをクリック
    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // FABボタンが表示される
    await expect(page.getByRole("button", { name: "追加メニュー" })).toBeVisible();
  });

  test("FABから話題を追加できる", async ({ page }) => {
    const memberName = `モバイル_話題追加_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // FABをタップしてメニューを開く
    await page.getByRole("button", { name: "追加メニュー" }).click();

    // 話題を追加
    await page.getByRole("button", { name: "話題を追加" }).click();

    // トピック入力フィールドが2つになる
    const topicInputs = page.getByPlaceholder("話題のタイトル");
    await expect(topicInputs).toHaveCount(2);
  });

  test("FABからアクションを追加できる", async ({ page }) => {
    const memberName = `モバイル_アクション追加_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // FABをタップしてメニューを開く
    await page.getByRole("button", { name: "追加メニュー" }).click();

    // アクションを追加
    await page.getByRole("button", { name: "アクション追加" }).click();

    // アクション入力フィールドが表示される
    const actionInputs = page.getByPlaceholder("アクションのタイトル");
    await expect(actionInputs).toHaveCount(1);
  });

  test("デスクトップビューポートではFABが表示されない", async ({ page }) => {
    // このテストはデスクトップビューポートで実行
    await page.setViewportSize({ width: 1280, height: 720 });

    const memberName = `デスクトップ_FAB非表示_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // FABボタンは非表示
    await expect(page.getByRole("button", { name: "追加メニュー" })).not.toBeVisible();

    // デスクトップではインライン追加ボタンが表示される
    await expect(page.getByRole("button", { name: "+ 話題を追加" })).toBeVisible();
  });
});
