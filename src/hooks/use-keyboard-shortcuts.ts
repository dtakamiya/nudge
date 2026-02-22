"use client";

import { useEffect, useRef } from "react";

type ShortcutCallbacks = {
  readonly onNewMember: () => void;
  readonly onNewMeeting: () => void;
  readonly onShowHelp: () => void;
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

      const { onNewMember, onNewMeeting, onShowHelp } = callbacksRef.current;

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
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
