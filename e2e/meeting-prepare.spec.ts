import { expect, test } from "@playwright/test";

import { createMeetingFromDetail, createMemberAndNavigateToDetail } from "./helpers";

test.describe("ミーティング準備", () => {
  test("準備ページに遷移できる", async ({ page }) => {
    const memberName = `準備テスト_遷移_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // 1on1を準備ボタンをクリック
    await page.getByRole("link", { name: "1on1 を準備" }).click();

    // 準備ページが表示される
    await expect(page.getByRole("heading", { name: `${memberName}との1on1 準備` })).toBeVisible();
  });

  test("準備ページにアジェンダセクションが表示される", async ({ page }) => {
    const memberName = `準備テスト_セクション_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "1on1 を準備" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1 準備` })).toBeVisible();

    // アジェンダセクションが表示される（CardTitle として表示）
    await expect(page.getByText("アジェンダ", { exact: true })).toBeVisible();

    // テンプレートセクションが表示される（CardTitle: "テンプレートを適用"）
    await expect(page.getByText("テンプレートを適用")).toBeVisible();

    // 前回の振り返りセクションが表示される
    await expect(page.getByText("前回の振り返り")).toBeVisible();
  });

  test("アジェンダに話題を追加・削除できる", async ({ page }) => {
    const memberName = `準備テスト_話題_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "1on1 を準備" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1 準備` })).toBeVisible();

    // 最初の話題のタイトルを入力
    const topicInputs = page.getByPlaceholder("話題のタイトル");
    await topicInputs.first().fill("最初の話題");

    // 話題を追加
    await page.getByRole("button", { name: "+ 話題を追加" }).click();

    // 2つ目の話題入力フィールドが表示される
    await expect(topicInputs).toHaveCount(2);

    // 2つ目の話題を入力
    await topicInputs.nth(1).fill("2つ目の話題");

    // 削除ボタンが表示される（2つ以上の場合のみ）
    // PrepareTopicItem の aria-label は「{title}を削除」の形式
    const deleteButtons = page.getByRole("button", { name: /を削除$/ });
    await expect(deleteButtons.first()).toBeVisible();

    // 1つ目の話題を削除
    await deleteButtons.first().click();

    // 話題が1つに減る
    await expect(topicInputs).toHaveCount(1);
  });

  test("準備からミーティング作成ページに遷移できる", async ({ page }) => {
    const memberName = `準備テスト_開始_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "1on1 を準備" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1 準備` })).toBeVisible();

    // 話題を入力
    await page.getByPlaceholder("話題のタイトル").first().fill("準備した話題");

    // 記録を開始ボタンをクリック
    await page.getByRole("link", { name: /記録を開始/ }).click();

    // ミーティング作成ページの URL に遷移するのを待つ（/meetings/new を含む）
    await page.waitForURL(/\/meetings\/new/, { timeout: 15000 });

    // ミーティング作成ページのheadingが表示される（「準備」が含まれないことを確認）
    await expect(
      page.getByRole("heading", { name: `${memberName}との1on1`, exact: true }),
    ).toBeVisible({ timeout: 10000 });

    // 準備した話題がフォームに反映されている
    const topicInput = page.getByPlaceholder("話題のタイトル").first();
    await expect(topicInput).toHaveValue("準備した話題");
  });

  test("パンくずリストが正しく表示される", async ({ page }) => {
    const memberName = `準備テスト_パンくず_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    await page.getByRole("link", { name: "1on1 を準備" }).click();

    const breadcrumb = page.getByLabel("パンくずリスト");
    await expect(breadcrumb.getByRole("link", { name: "ダッシュボード" })).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: memberName })).toBeVisible();
    await expect(breadcrumb.getByText("1on1 準備")).toBeVisible();
  });

  test("過去ミーティングがある場合に表示される", async ({ page }) => {
    const memberName = `準備テスト_過去_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);

    // ミーティングを1つ作成
    await createMeetingFromDetail(page, memberName, {
      topicTitle: "過去の話題テスト",
    });

    // 準備ページに遷移
    await page.getByRole("link", { name: "1on1 を準備" }).click();
    await expect(page.getByRole("heading", { name: `${memberName}との1on1 準備` })).toBeVisible();

    // 前回の振り返りセクションにデータが表示される
    await expect(page.getByText("前回の振り返り")).toBeVisible();
  });
});
