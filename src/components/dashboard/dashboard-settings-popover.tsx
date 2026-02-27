"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Settings2 } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { WidgetKey, WidgetSettings } from "@/hooks/use-dashboard-widget-settings";
import {
  createAnnouncements,
  screenReaderInstructions,
  sortableKeyboardCoordinates,
} from "@/lib/dnd-accessibility";

import { SortableWidgetSettingItem } from "./sortable-widget-setting-item";

type Props = {
  readonly settings: WidgetSettings;
  readonly visibleCount: number;
  readonly order: WidgetKey[];
  readonly onToggle: (key: WidgetKey) => void;
  readonly onReorder: (activeId: string, overId: string) => void;
};

export function DashboardSettingsPopover({
  settings,
  visibleCount,
  order,
  onToggle,
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const announcements = useMemo(() => createAnnouncements("ウィジェット"), []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions,
          }}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {order.map((key) => {
                const isLastVisible = settings[key] && visibleCount === 1;
                return (
                  <SortableWidgetSettingItem
                    key={key}
                    widgetKey={key}
                    checked={settings[key]}
                    disabled={isLastVisible}
                    onToggle={onToggle}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </PopoverContent>
    </Popover>
  );
}
