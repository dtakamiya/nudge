"use client";

import { CheckSquare, MessageSquare, Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useKeyboardVisibility } from "@/hooks/use-keyboard-visibility";

type Props = {
  readonly onAddTopic: () => void;
  readonly onAddAction: () => void;
};

export function MobileFab({ onAddTopic, onAddAction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isKeyboardVisible = useKeyboardVisibility();

  if (isKeyboardVisible) {
    return null;
  }

  function handleAddTopic() {
    onAddTopic();
    setIsOpen(false);
  }

  function handleAddAction() {
    onAddAction();
    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 md:hidden">
      {isOpen && (
        <div className="flex flex-col gap-2 animate-fade-in-up">
          <Button
            variant="secondary"
            className="min-h-[44px] min-w-[44px] shadow-lg gap-2"
            onClick={handleAddTopic}
          >
            <MessageSquare className="h-4 w-4" />
            話題を追加
          </Button>
          <Button
            variant="secondary"
            className="min-h-[44px] min-w-[44px] shadow-lg gap-2"
            onClick={handleAddAction}
          >
            <CheckSquare className="h-4 w-4" />
            アクション追加
          </Button>
        </div>
      )}
      <Button
        size="icon"
        className="h-14 w-14 min-h-[44px] min-w-[44px] rounded-full shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="追加メニュー"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
