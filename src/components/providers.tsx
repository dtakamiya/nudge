"use client";

import { ThemeProvider } from "next-themes";

import { FocusModeProvider } from "@/hooks/use-focus-mode";

export function Providers({ children }: { readonly children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FocusModeProvider>{children}</FocusModeProvider>
    </ThemeProvider>
  );
}
