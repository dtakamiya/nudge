import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * テスト用メンバーを作成してダッシュボードに戻る
 */
export async function createMember(
  page: Page,
  name: string,
  options?: { department?: string; position?: string },
) {
  await page.goto("/members/new");
  await page.getByLabel("名前 *").fill(name);
  if (options?.department) {
    await page.getByLabel("部署").fill(options.department);
  }
  if (options?.position) {
    await page.getByLabel("役職").fill(options.position);
  }
  await page.getByRole("button", { name: "登録する" }).click();
  await expect(page).toHaveURL("/", { timeout: 15000 });
}

/**
 * ダッシュボードのメンバー一覧テーブルからメンバー ID を取得して
 * 直接 /members/{id} に遷移する
 *
 * TableRow の onClick (router.push) は並列実行時に不安定なため、
 * テーブル行内の「1on1」リンク href からメンバー ID を抽出して page.goto() で遷移する
 */
export async function navigateToMemberDetail(page: Page, name: string) {
  await page.goto("/");

  // テーブル行を特定: role="link" でメンバー名を含む要素
  const tableRow = page.locator("main").locator("[role='link']").filter({ hasText: name }).first();
  await expect(tableRow).toBeVisible({ timeout: 10000 });

  // 行内の「1on1」リンク href から memberId を抽出
  // href の形式: /members/{id}/meetings/new
  const linkHref = await tableRow.locator("a[href]").first().getAttribute("href");
  if (!linkHref) {
    throw new Error(`Member link not found for "${name}"`);
  }
  const memberPath = linkHref.replace(/\/meetings\/new$/, "");

  // page.goto() で確実に遷移
  await page.goto(memberPath);
  await expect(page.getByRole("heading", { name: name })).toBeVisible({ timeout: 10000 });
}

/**
 * テスト用メンバーを作成してメンバー詳細ページに遷移する
 */
export async function createMemberAndNavigateToDetail(
  page: Page,
  name: string,
  options?: { department?: string; position?: string },
) {
  await createMember(page, name, {
    department: options?.department ?? "テスト部",
    position: options?.position,
  });
  await navigateToMemberDetail(page, name);
}
