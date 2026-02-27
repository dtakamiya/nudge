"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { WIDGET_LABELS, type WidgetKey } from "@/hooks/use-dashboard-widget-settings";
import { cn } from "@/lib/utils";

type Props = {
  readonly widgetKey: WidgetKey;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onToggle: (key: WidgetKey) => void;
};

export function SortableWidgetSettingItem({ widgetKey, checked, disabled, onToggle }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widgetKey,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = WIDGET_LABELS[widgetKey];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md px-1 py-1",
        isDragging && "opacity-50 bg-muted ring-1 ring-primary",
      )}
    >
      <button
        type="button"
        data-testid={`widget-drag-handle-${widgetKey}`}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground p-0.5"
        {...attributes}
        {...listeners}
        aria-label={`${label}を並び替え`}
        aria-roledescription="並び替え可能"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <label
        className={cn(
          "flex items-center gap-2 flex-1",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle(widgetKey)}
          disabled={disabled}
          aria-label={label}
        />
        <span className="text-sm">{label}</span>
      </label>
    </div>
  );
}
