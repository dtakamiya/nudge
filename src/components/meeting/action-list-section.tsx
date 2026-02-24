"use client";

import { type Announcements, closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { screenReaderInstructions } from "@/lib/dnd-accessibility";

import type { ActionFormData } from "./meeting-form.types";
import type { TagData } from "./sortable-action-item";
import { SortableActionItem } from "./sortable-action-item";

type Props = {
  actionItems: ActionFormData[];
  actionIds: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: any;
  announcements: Announcements;
  onAdd: () => void;
  onUpdate: (index: number, field: "title" | "description" | "dueDate", value: string) => void;
  onRemove: (index: number) => void;
  onTagsChange: (index: number, tags: TagData[]) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function ActionListSection({
  actionItems,
  actionIds,
  sensors,
  announcements,
  onAdd,
  onUpdate,
  onRemove,
  onTagsChange,
  onDragEnd,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">アクションアイテム</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            + アクション追加
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {actionItems.length === 0 && (
          <p className="text-sm text-muted-foreground">アクションはまだありません</p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions,
          }}
        >
          <SortableContext items={actionIds} strategy={verticalListSortingStrategy}>
            {actionItems.map((action, index) => (
              <SortableActionItem
                key={`action-${index}`}
                id={`action-${index}`}
                title={action.title}
                description={action.description}
                dueDate={action.dueDate}
                index={index}
                tags={action.tags}
                onTagsChange={onTagsChange}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
