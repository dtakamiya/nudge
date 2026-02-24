"use client";

import { useEffect, useRef } from "react";

export type ShortcutContext = "global" | "recording";

export type ShortcutEntry = {
  readonly key: string;
  readonly description: string;
  readonly context: ShortcutContext;
};

export const KEYBOARD_SHORTCUTS: ReadonlyArray<ShortcutEntry> = [
  { key: "n", description: "新規メンバーを追加", context: "global" },
  { key: "m", description: "新規ミーティングを作成", context: "global" },
  { key: "f", description: "フォーカスモード切り替え", context: "global" },
  { key: "⌘ K", description: "検索", context: "global" },
  { key: "?", description: "ショートカット一覧を表示", context: "global" },
  { key: "Space", description: "タイマー開始/一時停止", context: "recording" },
  { key: "T", description: "新しいトピックを追加", context: "recording" },
  { key: "A", description: "アクションアイテムを追加", context: "recording" },
  { key: "Esc", description: "ダイアログを閉じる", context: "global" },
];

type ShortcutCallbacks = {
  readonly onNewMember: () => void;
  readonly onNewMeeting: () => void;
  readonly onShowHelp: () => void;
  readonly onToggleFocusMode?: () => void;
};

function isTypingTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks): void {
  // useRef でコールバックを最新に保つ（依存配列の問題を回避）
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement)) return;

      const { onNewMember, onNewMeeting, onShowHelp, onToggleFocusMode } = callbacksRef.current;

      switch (e.key) {
        case "n":
          e.preventDefault();
          onNewMember();
          break;
        case "m":
          e.preventDefault();
          onNewMeeting();
          break;
        case "?":
          e.preventDefault();
          onShowHelp();
          break;
        case "f":
          e.preventDefault();
          onToggleFocusMode?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
