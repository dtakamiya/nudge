"use client";

import { useEffect, useState } from "react";

const KEYBOARD_THRESHOLD = 150;

export function useKeyboardVisibility(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const viewport = globalThis.visualViewport;
    if (!viewport) return;

    function handleResize() {
      const viewport = globalThis.visualViewport;
      if (!viewport) return;
      const heightDiff = globalThis.innerHeight - viewport.height;
      setIsKeyboardVisible(heightDiff > KEYBOARD_THRESHOLD);
    }

    viewport.addEventListener("resize", handleResize);
    return () => {
      viewport.removeEventListener("resize", handleResize);
    };
  }, []);

  return isKeyboardVisible;
}
