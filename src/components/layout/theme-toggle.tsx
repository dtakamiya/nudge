"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

const modes = [
  { value: "system", icon: Monitor, label: "システム" },
  { value: "light", icon: Sun, label: "ライト" },
  { value: "dark", icon: Moon, label: "ダーク" },
] as const;

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 ${
            theme === value
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
