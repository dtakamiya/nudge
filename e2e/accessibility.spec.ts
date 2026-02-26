import { expect, test } from "@playwright/test";

import { runAxe } from "./helpers";

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
});
