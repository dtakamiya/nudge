"use client";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS } from "@/lib/constants";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string | null;
};

type Props = {
  topic: Topic;
  onNotesChange: (topicId: string, notes: string) => void;
  onBlur?: (topicId: string) => void;
};

export function RecordingTopicItem({ topic, onNotesChange, onBlur }: Props) {
  const categoryLabel = CATEGORY_LABELS[topic.category] ?? topic.category;

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3 bg-card">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{categoryLabel}</Badge>
        <span className="text-sm font-medium">{topic.title}</span>
      </div>
      <Textarea
        value={topic.notes ?? ""}
        onChange={(e) => onNotesChange(topic.id, e.target.value)}
        onBlur={() => onBlur?.(topic.id)}
        placeholder="メモを入力..."
        rows={3}
        className="resize-none"
      />
    </div>
  );
}
