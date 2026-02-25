"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

/**
 * Server Action の統一エラーハンドリング型。
 * すべての書き込み系 Server Action はこの型を返却する。
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function toPrismaErrorMessage(err: PrismaClientKnownRequestError): string {
  if (err.code === "P2002") return "すでに同じ名前のデータが存在します";
  if (err.code === "P2025") return "対象のデータが見つかりません";
  return "データベースエラーが発生しました";
}

/**
 * Server Action のエラーを ActionResult に変換するヘルパー。
 * try-catch ブロックのラッパーとして使用する。
 * - ZodError: バリデーションエラーとして fieldErrors を付与
 * - PrismaClientKnownRequestError: エラーコードに応じた日本語メッセージ
 * - Error: そのメッセージをそのまま返す
 * - その他: 予期しないエラーメッセージを返す
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
    if (err instanceof PrismaClientKnownRequestError) {
      return { success: false, error: toPrismaErrorMessage(err) };
    }
    const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
    return { success: false, error: message };
  }
}
