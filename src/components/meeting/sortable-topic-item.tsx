"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function SortableTopicItem({
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded p-3 flex flex-col gap-2 bg-card ${isDragging ? "opacity-50 ring-2 ring-primary" : ""}`}
    >
      <div className="flex gap-2 items-end">
        <button
          type="button"
          data-testid={`drag-handle-${id}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground self-center"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <Label>カテゴリ</Label>
          <Select value={category} onValueChange={(val) => onUpdate(index, "category", val)}>
            <SelectTrigger>
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
          <Label>タイトル</Label>
          <Input
            value={title}
            onChange={(e) => onUpdate(index, "title", e.target.value)}
            placeholder="話題のタイトル"
          />
        </div>
        {showDelete && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
            削除
          </Button>
        )}
      </div>
      <div>
        <Label>メモ</Label>
        <Textarea
          value={notes}
          onChange={(e) => onUpdate(index, "notes", e.target.value)}
          placeholder="詳細メモ"
          rows={2}
        />
      </div>
    </div>
  );
}
