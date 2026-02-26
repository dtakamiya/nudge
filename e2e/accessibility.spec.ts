import { expect, test } from "@playwright/test";

import {
  createMeetingFromDetail,
  createMemberAndNavigateToDetail,
  navigateToFirstMeetingDetail,
  runAxe,
} from "./helpers";

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
    // ミーティング詳細ページは複雑なため axe スキャンに時間がかかる
    test.setTimeout(90000);
    const memberName = `A11yテスト_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName);
    await createMeetingFromDetail(page, memberName, {
      topicTitle: "a11y確認用トピック",
    });
    await navigateToFirstMeetingDetail(page, memberName);
    await runAxe(page, "ミーティング詳細");
  });
});
