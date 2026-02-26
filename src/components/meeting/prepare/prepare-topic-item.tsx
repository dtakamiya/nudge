"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
];

type Props = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly notes: string;
  readonly index: number;
  readonly showDelete: boolean;
  readonly onUpdate: (index: number, field: "category" | "title" | "notes", value: string) => void;
  readonly onRemove: (index: number) => void;
};

export function PrepareTopicItem({
  id,
  category,
  title,
  notes,
  index,
  showDelete,
  onUpdate,
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
  const categoryId = `prepare-${itemId}-category`;
  const titleId = `prepare-${itemId}-title`;
  const notesId = `prepare-${itemId}-notes`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 flex flex-col gap-2 bg-card ${
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex gap-2 items-end">
        <button
          type="button"
          data-testid={`prepare-drag-handle-${id}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground self-center p-1"
          {...attributes}
          {...listeners}
          aria-label={`${title || "話題"}を並び替え`}
          aria-roledescription="並び替え可能"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <Label htmlFor={categoryId}>カテゴリ</Label>
          <Select value={category} onValueChange={(val) => onUpdate(index, "category", val)}>
            <SelectTrigger id={categoryId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-[2]">
          <Label htmlFor={titleId}>タイトル</Label>
          <Input
            id={titleId}
            value={title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="話題のタイトル"
          />
        </div>
        {showDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-end shrink-0"
            onClick={() => onRemove(index)}
            aria-label={`${title || "この話題"}を削除`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div>
        <Label htmlFor={notesId}>メモ</Label>
        <Textarea
          id={notesId}
          value={notes}
          onChange={(e) => onUpdate(index, "notes", e.target.value)}
          placeholder="事前メモ（任意）"
          rows={2}
        />
      </div>
    </div>
  );
}
