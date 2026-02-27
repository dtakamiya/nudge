"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { ActionPriority } from "@/components/meeting/form";
import { TagBadge } from "@/components/tag/tag-badge";
import { TagInput } from "@/components/tag/tag-input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TagData = {
  id?: string;
  name: string;
  color?: string;
};

type Props = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly dueDate: string;
  readonly priority: ActionPriority;
  readonly index: number;
  readonly tags?: TagData[];
  readonly onTagsChange?: (index: number, tags: TagData[]) => void;
  readonly onUpdate: (
    index: number,
    field: "title" | "description" | "dueDate",
    value: string,
  ) => void;
  readonly onPriorityChange?: (index: number, priority: ActionPriority) => void;
  readonly onRemove: (index: number) => void;
};

export function SortableActionItem({
  id,
  title,
  description,
  dueDate,
  priority,
  index,
  tags = [],
  onTagsChange,
  onUpdate,
  onPriorityChange,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemId = id || String(index);
  const titleId = `action-${itemId}-title`;
  const dueDateId = `action-${itemId}-dueDate`;
  const descriptionId = `action-${itemId}-description`;

  function handleTagsChange(newTags: TagData[]) {
    onTagsChange?.(index, newTags);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 flex flex-col gap-2 bg-card ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
    >
      <div className="flex flex-wrap md:flex-nowrap gap-2 items-end">
        <button
          type="button"
          data-testid={`drag-handle-${id}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground self-center p-2"
          {...attributes}
          {...listeners}
          aria-label={`${title || "アクションアイテム"}を並び替え`}
          aria-roledescription="並び替え可能"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-[2]">
          <Label htmlFor={titleId}>タイトル</Label>
          <Input
            id={titleId}
            value={title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="アクションのタイトル"
          />
        </div>
        <div className="hidden md:block flex-1">
          <Label htmlFor={dueDateId}>期限</Label>
          <DatePicker
            id={dueDateId}
            value={dueDate}
            onChange={(value) => onUpdate(index, "dueDate", value)}
          />
        </div>
        <div className="hidden md:block flex-none w-20">
          <Label htmlFor={`action-${itemId}-priority`}>優先度</Label>
          <Select
            value={priority}
            onValueChange={(val) => onPriorityChange?.(index, val as ActionPriority)}
          >
            <SelectTrigger id={`action-${itemId}-priority`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">高</SelectItem>
              <SelectItem value="MEDIUM">中</SelectItem>
              <SelectItem value="LOW">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          onClick={() => onRemove(index)}
        >
          削除
        </Button>
      </div>
      {/* モバイル用 2行目: 期限・優先度 */}
      <div className="flex gap-2 items-end pl-8 md:hidden">
        <div className="flex-1">
          <Label htmlFor={`${dueDateId}-mobile`}>期限</Label>
          <DatePicker
            id={`${dueDateId}-mobile`}
            value={dueDate}
            onChange={(value) => onUpdate(index, "dueDate", value)}
          />
        </div>
        <div className="flex-none w-24">
          <Label htmlFor={`action-${itemId}-priority-mobile`}>優先度</Label>
          <Select
            value={priority}
            onValueChange={(val) => onPriorityChange?.(index, val as ActionPriority)}
          >
            <SelectTrigger id={`action-${itemId}-priority-mobile`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">高</SelectItem>
              <SelectItem value="MEDIUM">中</SelectItem>
              <SelectItem value="LOW">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={descriptionId}>説明</Label>
        <Input
          id={descriptionId}
          value={description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          placeholder="詳細（任意）"
        />
      </div>
      <div>
        <Label>タグ</Label>
        {onTagsChange ? (
          <TagInput selectedTags={tags} onTagsChange={handleTagsChange} />
        ) : (
          tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.map((tag) => (
                <TagBadge key={tag.id ?? tag.name} name={tag.name} color={tag.color} size="sm" />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
