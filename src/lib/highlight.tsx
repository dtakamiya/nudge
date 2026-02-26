import React from "react";

/**
 * 正規表現の特殊文字をエスケープする
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * テキスト内のクエリに一致する部分を <mark> タグでハイライトする。
 * クエリが空の場合、または一致がない場合はそのまま文字列を返す。
 * 大文字・小文字を区別しない。
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const escaped = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  if (parts.length <= 1) return text;

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="rounded-sm bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/**
 * テキストからクエリにマッチした箇所の前後コンテキストを含むスニペットを抽出する。
 * マッチがない場合は先頭から contextLength*2 文字を返す。
 */
export function extractSnippet(text: string, query: string, contextLength = 50): string {
  if (!text) return "";
  if (!query) return text.slice(0, contextLength * 2);

  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());

  if (idx === -1) return text.slice(0, contextLength * 2);

  const start = Math.max(0, idx - contextLength);
  const end = Math.min(text.length, idx + query.length + contextLength);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return prefix + text.slice(start, end) + suffix;
}
