"use client";

import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { CoachingPanel } from "./coaching-panel";

export function CoachingSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg lg:hidden"
          aria-label="コーチングアシスト"
        >
          <Lightbulb className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>コーチングアシスト</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <CoachingPanel compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
