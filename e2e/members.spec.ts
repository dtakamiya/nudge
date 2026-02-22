import { expect, test } from "@playwright/test";

import { createMember, navigateToMemberDetail } from "./helpers";

test.describe("メンバー管理", () => {
  test("メンバー追加ページが表示される", async ({ page }) => {
    await page.goto("/members/new");

    await expect(page.getByRole("heading", { name: "メンバー追加" })).toBeVisible();

    // カードタイトル「メンバー登録」が表示される
    await expect(page.getByText("メンバー登録")).toBeVisible();
  });

  test("メンバー登録フォームに入力フィールドが表示される", async ({ page }) => {
    await page.goto("/members/new");

    await expect(page.getByLabel("名前 *")).toBeVisible();
    await expect(page.getByLabel("部署")).toBeVisible();
    await expect(page.getByLabel("役職")).toBeVisible();
    await expect(page.getByRole("button", { name: "登録する" })).toBeVisible();
  });

  test("名前未入力で送信するとバリデーションエラーになる", async ({ page }) => {
    await page.goto("/members/new");

    await page.getByRole("button", { name: "登録する" }).click();

    // HTML5 required バリデーションによりページ遷移しない
    await expect(page).toHaveURL("/members/new");
  });

  test("新規メンバーを作成してダッシュボードに遷移する", async ({ page }) => {
    const memberName = `テストメンバー_${Date.now()}`;

    await createMember(page, memberName, {
      department: "エンジニアリング",
      position: "シニアエンジニア",
    });

    // ダッシュボードに遷移済み
    await expect(page).toHaveURL("/");

    // 作成したメンバーがメインコンテンツのテーブルに表示される
    await expect(page.locator("main").getByText(memberName).first()).toBeVisible();
  });

  test("作成したメンバーの詳細ページを表示できる", async ({ page }) => {
    const memberName = `詳細確認メンバー_${Date.now()}`;

    await createMember(page, memberName, {
      department: "プロダクト部",
      position: "PM",
    });

    await navigateToMemberDetail(page, memberName);

    // メンバー詳細ページの内容を確認
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible();
    await expect(page.getByText("プロダクト部 / PM")).toBeVisible();

    // 1on1履歴セクションが表示される
    await expect(page.getByRole("heading", { name: "1on1履歴" })).toBeVisible();

    // アクションアイテムセクションが表示される
    await expect(page.getByRole("heading", { name: "アクションアイテム" })).toBeVisible();

    // 新規1on1ボタンが表示される
    await expect(page.getByRole("link", { name: "新規1on1" })).toBeVisible();
  });

  test("メンバーが未登録の場合、空の状態メッセージが表示される", async ({ page }) => {
    await page.goto("/");

    // メンバーが存在する場合はテーブルが表示される
    const hasMembers = await page.locator("table").isVisible();
    if (!hasMembers) {
      await expect(page.getByText("メンバーがまだ登録されていません")).toBeVisible();
      await expect(page.getByRole("link", { name: "メンバーを追加" })).toBeVisible();
    }
  });

  test("パンくずリストが正しく表示される", async ({ page }) => {
    await page.goto("/members/new");

    const breadcrumb = page.getByLabel("パンくずリスト");
    await expect(breadcrumb.getByRole("link", { name: "ダッシュボード" })).toBeVisible();
    await expect(breadcrumb.getByText("メンバー追加")).toBeVisible();
  });
});
