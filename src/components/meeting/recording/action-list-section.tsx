"use client";

import { type Announcements, closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { screenReaderInstructions } from "@/lib/dnd-accessibility";

import type { ActionFormData, ActionPriority } from "../form/meeting-form.types";
import type { TagData } from "./sortable-action-item";
import { SortableActionItem } from "./sortable-action-item";

type Props = {
  actionItems: ActionFormData[];
  actionIds: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: any;
  announcements: Announcements;
  goals?: ReadonlyArray<{ id: string; title: string }>;
  onAdd: () => void;
  onUpdate: (index: number, field: "title" | "description" | "dueDate", value: string) => void;
  onRemove: (index: number) => void;
  onTagsChange: (index: number, tags: TagData[]) => void;
  onPriorityChange: (index: number, priority: ActionPriority) => void;
  onGoalChange?: (index: number, goalId: string | null) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function ActionListSection({
  actionItems,
  actionIds,
  sensors,
  announcements,
  goals,
  onAdd,
  onUpdate,
  onRemove,
  onTagsChange,
  onPriorityChange,
  onGoalChange,
  onDragEnd,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">アクションアイテム</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={onAdd}
          >
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
                priority={action.priority}
                index={index}
                tags={action.tags}
                goalId={action.goalId}
                goals={goals}
                onTagsChange={onTagsChange}
                onUpdate={onUpdate}
                onPriorityChange={onPriorityChange}
                onGoalChange={onGoalChange}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
