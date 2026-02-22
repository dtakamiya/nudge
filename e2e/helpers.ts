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

/**
 * メンバー詳細ページからミーティングを作成してメンバー詳細に戻る
 * 事前に createMemberAndNavigateToDetail でメンバー詳細ページにいることが前提
 */
export async function createMeetingFromDetail(
  page: Page,
  memberName: string,
  options?: { topicTitle?: string; actionTitle?: string },
) {
  await page.getByRole("link", { name: "新規1on1" }).click();
  await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible();

  // トピックを入力
  const topicTitle = options?.topicTitle ?? "テスト話題";
  await page.getByPlaceholder("話題のタイトル").first().fill(topicTitle);

  // アクションアイテムを追加（オプション）
  if (options?.actionTitle) {
    await page.getByRole("button", { name: "+ アクション追加" }).click();
    await page.getByPlaceholder("アクションのタイトル").first().fill(options.actionTitle);
  }

  // 保存
  await page.getByRole("button", { name: "1on1を保存" }).click();
  await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });
}

/**
 * メンバー詳細ページから最初のミーティング詳細ページに遷移する
 * 事前にメンバー詳細ページにいて、ミーティングが存在することが前提
 */
export async function navigateToFirstMeetingDetail(page: Page, memberName: string) {
  const meetingCards = page.locator(
    "main a[href*='/meetings/']:not([href$='/new']):not([href$='/prepare'])",
  );
  await expect(meetingCards.first()).toBeVisible({ timeout: 10000 });
  await meetingCards.first().click();
  await page.waitForURL(/\/meetings\/[^/]+$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: `${memberName}との1on1` })).toBeVisible({
    timeout: 10000,
  });
}

/**
 * ダッシュボードのメンバー一覧テーブルからメンバー ID を取得する
 */
export async function getMemberIdFromDashboard(page: Page, name: string): Promise<string> {
  await page.goto("/");
  const tableRow = page.locator("main").locator("[role='link']").filter({ hasText: name }).first();
  await expect(tableRow).toBeVisible({ timeout: 10000 });

  const linkHref = await tableRow.locator("a[href]").first().getAttribute("href");
  if (!linkHref) {
    throw new Error(`Member link not found for "${name}"`);
  }
  // /members/{id}/meetings/new → {id} を取得
  const match = linkHref.match(/\/members\/([^/]+)/);
  if (!match) {
    throw new Error(`Could not extract member ID from "${linkHref}"`);
  }
  return match[1];
}
