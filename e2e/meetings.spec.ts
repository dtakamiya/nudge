import { test, expect } from "@playwright/test";
import { createMemberAndNavigateToDetail } from "./helpers";

test.describe("ミーティング管理", () => {
  test("メンバー詳細から新規1on1ページに遷移できる", async ({ page }) => {
    const memberName = `会議テスト_遷移_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ボタンをクリック
    await page.getByRole("link", { name: "新規1on1" }).click();

    // ミーティング作成ページが表示される
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // フォームの主要要素が表示される
    await expect(page.getByLabel("日付 *")).toBeVisible();
    await expect(page.getByText("話題", { exact: true })).toBeVisible();
    await expect(page.getByText("アクションアイテム", { exact: true })).toBeVisible();
  });

  test("ミーティングを作成してメンバー詳細に遷移する", async ({ page }) => {
    const memberName = `会議テスト_作成_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ページに遷移
    await page.getByRole("link", { name: "新規1on1" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

    // 話題を入力
    await page.getByPlaceholder("話題のタイトル").first().fill("プロジェクト進捗");

    // 保存
    await page.getByRole("button", { name: "1on1を保存" }).click();

    // メンバー詳細ページに遷移
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });

    // 1on1履歴が表示される
    await expect(page.getByRole("heading", { name: "1on1履歴" })).toBeVisible();
  });

  test("ミーティングにトピックを追加できる", async ({ page }) => {
    const memberName = `会議テスト_トピック_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ページに遷移
    await page.getByRole("link", { name: "新規1on1" }).click();

    // 最初のトピックを入力
    const topicInputs = page.getByPlaceholder("話題のタイトル");
    await topicInputs.first().fill("最初の話題");

    // 話題を追加ボタンをクリック
    await page.getByRole("button", { name: "+ 話題を追加" }).click();

    // 2つ目のトピック入力フィールドが表示される
    await expect(topicInputs).toHaveCount(2);

    // 2つ目のトピックを入力
    await topicInputs.nth(1).fill("2つ目の話題");

    // 保存
    await page.getByRole("button", { name: "1on1を保存" }).click();

    // メンバー詳細ページに遷移
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });
  });

  test("ミーティングにアクションアイテムを追加できる", async ({ page }) => {
    const memberName = `会議テスト_アクション_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 新規1on1ページに遷移
    await page.getByRole("link", { name: "新規1on1" }).click();

    // トピックを入力
    await page.getByPlaceholder("話題のタイトル").first().fill("進捗レビュー");

    // アクション追加ボタンをクリック
    await page.getByRole("button", { name: "+ アクション追加" }).click();

    // アクションアイテムの入力フィールドが表示される
    const actionTitleInput = page.getByPlaceholder("アクションのタイトル");
    await expect(actionTitleInput.first()).toBeVisible();

    // アクションアイテムを入力
    await actionTitleInput.first().fill("テストレポートを作成する");

    // 保存
    await page.getByRole("button", { name: "1on1を保存" }).click();

    // メンバー詳細ページに遷移
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });

    // アクションアイテムセクションに追加したアイテムが表示される
    await expect(page.getByText("テストレポートを作成する").first()).toBeVisible();
  });

  test("ミーティング詳細ページが表示される", async ({ page }) => {
    const memberName = `会議テスト_詳細_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // ミーティングを作成
    await page.getByRole("link", { name: "新規1on1" }).click();
    await page.getByPlaceholder("話題のタイトル").first().fill("詳細表示テスト用トピック");
    await page.getByRole("button", { name: "1on1を保存" }).click();
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });

    // 1on1履歴セクションの最初のリンクをクリック
    // "new" や "prepare" を除く実際のミーティングリンクを対象にする
    const meetingCards = page.locator(
      "main a[href*='/meetings/']:not([href$='/new']):not([href$='/prepare'])",
    );
    await expect(meetingCards.first()).toBeVisible({ timeout: 10000 });
    await meetingCards.first().click();

    // ミーティング詳細ページの URL に遷移するのを待つ
    await page.waitForURL(/\/meetings\/[^/]+$/, { timeout: 15000 });

    // ミーティング詳細ページが表示される
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible({
      timeout: 10000,
    });

    // 話題セクションが表示される
    await expect(page.getByRole("heading", { name: "話題" })).toBeVisible({ timeout: 10000 });

    // アクションアイテムセクションが表示される
    await expect(page.getByRole("heading", { name: "アクションアイテム" })).toBeVisible({
      timeout: 10000,
    });
  });
});
