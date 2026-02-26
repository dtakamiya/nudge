"use client";

import { Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFocusMode } from "@/hooks/use-focus-mode";

export function FocusModeIndicator() {
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  if (!isFocusMode) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 animate-fade-in-up">
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleFocusMode}
        className="flex flex-col items-center gap-1 h-auto py-3 px-2 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg"
        aria-label="フォーカスモードを終了 (F)"
        title="フォーカスモードを終了 (F)"
      >
        <Minimize2 className="h-4 w-4 text-primary" />
        <span className="text-[10px] font-medium text-primary [writing-mode:vertical-rl]">
          フォーカス
        </span>
      </Button>
    </div>
  );
}
