"use client";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  WIDGET_KEYS,
  WIDGET_LABELS,
  type WidgetKey,
  type WidgetSettings,
} from "@/hooks/use-dashboard-widget-settings";

type Props = {
  readonly settings: WidgetSettings;
  readonly visibleCount: number;
  readonly onToggle: (key: WidgetKey) => void;
};

export function DashboardSettingsPopover({ settings, visibleCount, onToggle }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="ウィジェット表示設定"
          className="text-muted-foreground"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="text-sm font-medium mb-3">ウィジェット表示設定</p>
        <div className="space-y-2">
          {WIDGET_KEYS.map((key) => {
            const isLastVisible = settings[key] && visibleCount === 1;
            return (
              <label
                key={key}
                className={`flex items-center gap-2 ${isLastVisible ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Checkbox
                  checked={settings[key]}
                  onCheckedChange={() => onToggle(key)}
                  disabled={isLastVisible}
                  aria-label={WIDGET_LABELS[key]}
                />
                <span className="text-sm">{WIDGET_LABELS[key]}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
