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
