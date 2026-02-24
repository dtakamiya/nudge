"use server";

import { ZodError } from "zod";

/**
 * Server Action の統一エラーハンドリング型。
 * すべての書き込み系 Server Action はこの型を返却する。
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Server Action のエラーを ActionResult に変換するヘルパー。
 * try-catch ブロックのラッパーとして使用する。
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    console.error("[Server Action Error]", err);
    if (err instanceof ZodError) {
      const message = err.issues.map((issue) => issue.message).join("、");
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const field = issue.path.length > 0 ? issue.path.join(".") : "_root";
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }
      return { success: false, error: message, fieldErrors };
    }
    const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
    return { success: false, error: message };
  }
}
