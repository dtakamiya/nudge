import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * テスト用メンバーを作成してメンバー詳細ページに遷移する
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
  await expect(page).toHaveURL(/\/members\/[^/]+$/, { timeout: 15000 });
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
 * createMember 後はすでにメンバー詳細ページにいるため、見出しを確認するだけ
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
  await expect(page.getByRole("heading", { name })).toBeVisible({ timeout: 10000 });
}

/**
 * ClosingDialog の確認ボタンをクリックして保存を確定する
 * アクションアイテムの有無でボタンラベルが変わるため両方に対応する
 */
export async function confirmSaveMeeting(page: Page) {
  const saveBtn = page.getByRole("button", { name: "保存する" });
  const saveWithoutActionBtn = page.getByRole("button", { name: "アクションなしで保存" });
  await saveBtn.or(saveWithoutActionBtn).first().waitFor({ timeout: 5000 });
  const hasSaveBtn = await saveBtn.isVisible();
  if (hasSaveBtn) {
    await saveBtn.click();
  } else {
    await saveWithoutActionBtn.click();
  }
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

  // 保存ボタンをクリック → ClosingDialog が表示されるので確認する
  await page.getByRole("button", { name: "1on1を保存" }).first().click();
  await confirmSaveMeeting(page);
  await expect(page.getByRole("heading", { name: memberName })).toBeVisible({ timeout: 15000 });
}

/**
 * メンバー詳細ページから最初のミーティング詳細ページに遷移する
 * 事前にメンバー詳細ページにいて、ミーティングが存在することが前提
 */
export async function navigateToFirstMeetingDetail(page: Page, memberName: string) {
  // デフォルトタブが「タイムライン」なので「1on1履歴」タブに切り替える
  await page.getByRole("tab", { name: "1on1履歴" }).click();
  await page.waitForURL(/tab=history/, { timeout: 10000 });

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
 * ミーティング詳細ページの「...」メニューから削除ダイアログを開く
 * MeetingHeaderActions の DropdownMenu を操作する
 */
export async function openMeetingDeleteDialog(page: Page) {
  // Radix UI DropdownMenuTrigger: data-slot="dropdown-menu-trigger" 属性を持つボタン
  const menuTrigger = page.locator("button[data-slot='dropdown-menu-trigger']");
  await menuTrigger.click();
  await page.getByRole("menuitem", { name: "削除" }).click();
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

/**
 * 指定ページで axe-core アクセシビリティスキャンを実行する。
 * critical / serious レベルの違反があればエラーをスローする。
 * 違反の詳細（要素セレクタ・ルールID・説明）をエラーメッセージに含める。
 */
export async function runAxe(page: Page, pageName: string): Promise<void> {
  const { AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const violations = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  if (violations.length > 0) {
    const details = violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.description}\n` +
          v.nodes.map((n) => `  要素: ${n.target}`).join("\n"),
      )
      .join("\n\n");
    throw new Error(
      `${pageName} にアクセシビリティ違反が ${violations.length} 件あります:\n\n${details}`,
    );
  }
}
