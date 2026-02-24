"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

interface FocusModeContextValue {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextValue | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.focusMode = isFocusMode ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.focusMode;
    };
  }, [isFocusMode]);

  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);
  const setFocusMode = (value: boolean) => setIsFocusMode(value);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error("useFocusMode must be used within a FocusModeProvider");
  }
  return context;
}
