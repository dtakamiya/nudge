"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useState } from "react";

import { TagBadge } from "@/components/tag/tag-badge";
import { TagInput } from "@/components/tag/tag-input";
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

export type TagData = {
  id?: string;
  name: string;
  color?: string;
};

type Props = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly notes: string;
  readonly index: number;
  readonly showDelete: boolean;
  readonly tags?: TagData[];
  readonly onTagsChange?: (index: number, tags: TagData[]) => void;
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
  tags = [],
  onTagsChange,
  onUpdate,
  onRemove,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const [isExpanded, setIsExpanded] = useState(() => notes.length > 0 || tags.length > 0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemId = id || String(index);
  const categoryId = `topic-${itemId}-category`;
  const titleId = `topic-${itemId}-title`;
  const notesId = `topic-${itemId}-notes`;

  function handleTagsChange(newTags: TagData[]) {
    onTagsChange?.(index, newTags);
  }

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
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}>
            削除
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            詳細を隠す
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            詳細を追加
          </>
        )}
      </Button>
      {isExpanded && (
        <>
          <div>
            <Label htmlFor={notesId}>メモ</Label>
            <Textarea
              id={notesId}
              value={notes}
              onChange={(e) => onUpdate(index, "notes", e.target.value)}
              placeholder="詳細メモ"
              rows={2}
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
                    <TagBadge
                      key={tag.id ?? tag.name}
                      name={tag.name}
                      color={tag.color}
                      size="sm"
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
