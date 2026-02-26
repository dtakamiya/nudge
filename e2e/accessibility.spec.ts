import { expect, test } from "@playwright/test";

import { createMeetingFromDetail, createMemberAndNavigateToDetail, runAxe } from "./helpers";

test.describe("アクセシビリティ（axe-core WCAG AA）", () => {
  test("ダッシュボードにアクセシビリティ違反がない", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
    await runAxe(page, "ダッシュボード");
  });

  test("メンバー一覧にアクセシビリティ違反がない", async ({ page }) => {
    await page.goto("/members");
    await expect(page.getByRole("heading", { name: "メンバー一覧" })).toBeVisible();
    await runAxe(page, "メンバー一覧");
  });

  test("アクション一覧にアクセシビリティ違反がない", async ({ page }) => {
    await page.goto("/actions");
    await expect(page.getByRole("heading", { name: "アクション一覧" })).toBeVisible();
    await runAxe(page, "アクション一覧");
  });

  test("ミーティング詳細にアクセシビリティ違反がない", async ({ page }) => {
    // テスト用メンバーとミーティングを作成
    await createMemberAndNavigateToDetail(page, "A11yテストメンバー");
    await createMeetingFromDetail(page, "A11yテストメンバー", {
      topicTitle: "a11y確認用トピック",
    });

    // 1on1履歴タブに切り替えてミーティング詳細へ遷移
    await page.getByRole("tab", { name: "1on1履歴" }).click();
    await page.waitForURL(/tab=history/, { timeout: 10000 });

    const meetingLinks = page.locator(
      "main a[href*='/meetings/']:not([href$='/new']):not([href$='/prepare'])",
    );
    await expect(meetingLinks.first()).toBeVisible({ timeout: 10000 });
    await meetingLinks.first().click();
    await page.waitForURL(/\/meetings\/[^/]+$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "A11yテストメンバーとの1on1" })).toBeVisible({
      timeout: 10000,
    });

    await runAxe(page, "ミーティング詳細");
  });
});
