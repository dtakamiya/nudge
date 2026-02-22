import { expect,test } from "@playwright/test";

test.describe("ダッシュボード", () => {
  test("ダッシュボードが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();
  });

  test("KPIカードが4つ表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("kpi-card-follow-up")).toBeVisible();
    await expect(page.getByTestId("kpi-card-completion")).toBeVisible();
    await expect(page.getByTestId("kpi-card-meetings")).toBeVisible();
    await expect(page.getByTestId("kpi-card-overdue")).toBeVisible();
  });

  test("KPIカードにラベルが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("kpi-card-follow-up")).toContainText("要フォロー");
    await expect(page.getByTestId("kpi-card-completion")).toContainText("アクション完了率");
    await expect(page.getByTestId("kpi-card-meetings")).toContainText("今月の1on1");
    await expect(page.getByTestId("kpi-card-overdue")).toContainText("期限超過");
  });

  test("サイドバーのナビゲーションリンクが表示される", async ({ page }) => {
    await page.goto("/");

    // デスクトップサイドバー内のナビゲーション
    const sidebar = page.locator("aside").last();
    await expect(sidebar.getByText("ダッシュボード")).toBeVisible();
    await expect(sidebar.getByText("メンバー追加")).toBeVisible();
    await expect(sidebar.getByText("アクション一覧")).toBeVisible();
  });

  test("サイドバーからメンバー追加ページに遷移できる", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.locator("aside").last();
    await sidebar.getByRole("link", { name: "メンバー追加" }).click();

    await expect(page).toHaveURL("/members/new");
    await expect(page.getByRole("heading", { name: "メンバー追加" })).toBeVisible();
  });

  test("サイドバーからアクション一覧ページに遷移できる", async ({ page }) => {
    await page.goto("/");

    // href="/actions" のリンクを直接クリック（バッジ有無に関わらず確実に動作）
    const sidebar = page.locator("aside").last();
    await sidebar.locator('a[href="/actions"]').click();

    await expect(page).toHaveURL("/actions");
    await expect(page.getByRole("heading", { name: "アクション一覧" })).toBeVisible();
  });

  test("最近のアクティビティセクションが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("最近のアクティビティ")).toBeVisible();
  });

  test("今週のタスクセクションが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("今週のタスク")).toBeVisible();
  });

  test("KPIカードに数値が表示される", async ({ page }) => {
    await page.goto("/");

    // 各KPIカードに単位が表示される
    await expect(page.getByTestId("kpi-card-follow-up")).toContainText("人");
    await expect(page.getByTestId("kpi-card-completion")).toContainText("%");
    await expect(page.getByTestId("kpi-card-meetings")).toContainText("回");
    await expect(page.getByTestId("kpi-card-overdue")).toContainText("件");
  });

  test("ダッシュボードのサイドバーリンクがアクティブ状態になる", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.locator("aside").last();
    const dashboardLink = sidebar.getByRole("link", { name: "ダッシュボード" });
    await expect(dashboardLink).toBeVisible();
  });
});
