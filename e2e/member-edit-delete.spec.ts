import { expect, test } from "@playwright/test";

import { createMemberAndNavigateToDetail } from "./helpers";

test.describe("メンバー編集・削除", () => {
  test("メンバー情報を編集できる", async ({ page }) => {
    const memberName = `編集テスト_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName, {
      department: "エンジニアリング",
      position: "エンジニア",
    });

    // 編集ダイアログを開く
    await page.getByRole("button", { name: "編集" }).click();
    await expect(page.getByText("メンバー情報の編集")).toBeVisible();

    // 名前を変更
    const nameInput = page.getByLabel("名前 *");
    await nameInput.clear();
    const updatedName = `${memberName}_更新済`;
    await nameInput.fill(updatedName);

    // 部署を変更
    const deptInput = page.getByLabel("部署");
    await deptInput.clear();
    await deptInput.fill("プロダクト部");

    // 更新する
    await page.getByRole("button", { name: "更新する" }).click();

    // ダイアログが閉じてページが更新される
    await expect(page.getByText("メンバー情報の編集")).not.toBeVisible({ timeout: 10000 });

    // 更新された名前が表示される
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible({ timeout: 10000 });

    // 更新された部署が表示される
    await expect(page.getByText("プロダクト部")).toBeVisible();
  });

  test("編集ダイアログをキャンセルできる", async ({ page }) => {
    const memberName = `編集キャンセル_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName, {
      department: "テスト部",
    });

    // 編集ダイアログを開く
    await page.getByRole("button", { name: "編集" }).click();
    await expect(page.getByText("メンバー情報の編集")).toBeVisible();

    // 名前を変更（保存しない）
    const nameInput = page.getByLabel("名前 *");
    await nameInput.clear();
    await nameInput.fill("キャンセルされるべき名前");

    // Escape キーまたはダイアログ外クリックでキャンセル
    await page.keyboard.press("Escape");

    // ダイアログが閉じる
    await expect(page.getByText("メンバー情報の編集")).not.toBeVisible({ timeout: 5000 });

    // 元の名前が維持される
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible();
  });

  test("メンバーを削除できる", async ({ page }) => {
    const memberName = `削除テスト_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName, {
      department: "テスト部",
    });

    // 削除ダイアログを開く
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("メンバーを削除しますか？")).toBeVisible();

    // 確認メッセージにメンバー名が含まれる
    await expect(page.getByText(`${memberName}のデータを削除します`)).toBeVisible();

    // 削除を実行
    await page.getByRole("button", { name: "削除する" }).click();

    // ダッシュボードに遷移する
    await expect(page).toHaveURL("/", { timeout: 15000 });

    // 削除されたメンバーがダッシュボードに表示されない
    // (他のテストメンバーがいる可能性があるため、特定のメンバー名を確認)
    const deletedMember = page.locator("main").getByText(memberName);
    await expect(deletedMember).toHaveCount(0);
  });

  test("削除ダイアログをキャンセルできる", async ({ page }) => {
    const memberName = `削除キャンセル_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName, {
      department: "テスト部",
    });

    // 削除ダイアログを開く
    await page.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText("メンバーを削除しますか？")).toBeVisible();

    // キャンセル
    await page.getByRole("button", { name: "キャンセル" }).click();

    // ダイアログが閉じる
    await expect(page.getByText("メンバーを削除しますか？")).not.toBeVisible({ timeout: 5000 });

    // メンバー詳細ページに留まる
    await expect(page.getByRole("heading", { name: memberName })).toBeVisible();
  });

  test("メンバー詳細ページに統計バーが表示される", async ({ page }) => {
    const memberName = `統計テスト_${Date.now()}`;
    await createMemberAndNavigateToDetail(page, memberName, {
      department: "テスト部",
    });

    // 統計バーの3つのカードが表示される
    await expect(page.getByText("最終1on1")).toBeVisible();
    await expect(page.getByText("通算1on1")).toBeVisible();
    await expect(page.getByText("未完了アクション")).toBeVisible();

    // 新規メンバーなので通算1on1は0回
    await expect(page.getByText("0").first()).toBeVisible();
  });
});
