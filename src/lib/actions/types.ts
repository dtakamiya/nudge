"use server";

/**
 * Server Action の統一エラーハンドリング型。
 * すべての書き込み系 Server Action はこの型を返却する。
 */
export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

/**
 * Server Action のエラーを ActionResult に変換するヘルパー。
 * try-catch ブロックのラッパーとして使用する。
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
    return { success: false, error: message };
  }
}
