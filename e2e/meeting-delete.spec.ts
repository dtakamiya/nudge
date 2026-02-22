import { test, expect } from "@playwright/test";
import {
  createMemberAndNavigateToDetail,
  createMeetingFromDetail,
  navigateToFirstMeetingDetail,
} from "./helpers";

test.describe("ミーティング削除", () => {
  test("ミーティング詳細ページから削除ダイアログを開ける", async ({ page }) => {
    const memberName = `削除テスト_ダイアログ_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, { topicTitle: "削除テスト用話題" });
    await navigateToFirstMeetingDetail(page, memberName);

    // 削除ボタンをクリック
    await page.getByRole("button", { name: "削除" }).click();

    // 削除確認ダイアログが表示される
    await expect(page.getByText("ミーティングを削除しますか？")).toBeVisible();
    await expect(page.getByText("この操作は取り消せません")).toBeVisible();
  });

  test("ミーティング削除をキャンセルできる", async ({ page }) => {
    const memberName = `削除テスト_キャンセル_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, { topicTitle: "キャンセルテスト話題" });
    await navigateToFirstMeetingDetail(page, memberName);

    // 削除ダイアログを開く
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("ミーティングを削除しますか？")).toBeVisible();

    // キャンセル
    await page.getByRole("button", { name: "キャンセル" }).click();

    // ダイアログが閉じてミーティング詳細ページに留まる
    await expect(page.getByText("ミーティングを削除しますか？")).not.toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();
  });

  test("ミーティングを削除するとメンバー詳細に遷移する", async ({ page }) => {
    const memberName = `削除テスト_実行_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, { topicTitle: "削除される話題" });
    await navigateToFirstMeetingDetail(page, memberName);

    // 削除ダイアログを開く
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("ミーティングを削除しますか？")).toBeVisible();

    // 削除を実行
    await page.getByRole("button", { name: "削除する" }).click();

    // メンバー詳細ページに遷移する
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });

    // URLがメンバー詳細ページに変わる
    await expect(page).toHaveURL(/\/members\/[^/]+$/, { timeout: 15000 });
  });

  test("ミーティング詳細ページに戻るボタンがある", async ({ page }) => {
    const memberName = `詳細テスト_戻る_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, { topicTitle: "戻るボタンテスト" });
    await navigateToFirstMeetingDetail(page, memberName);

    // 戻るボタンが表示される
    await expect(page.getByRole("link", { name: "戻る", exact: true })).toBeVisible();

    // 戻るボタンをクリック
    await page.getByRole("link", { name: "戻る", exact: true }).click();

    // メンバー詳細ページに遷移
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });
  });
});
