"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="w-4 h-4 mr-1.5" />
      印刷 / PDFで保存
    </Button>
  );
}
