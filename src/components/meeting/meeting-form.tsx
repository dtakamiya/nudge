"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMeeting } from "@/lib/actions/meeting-actions";
import { SortableTopicItem } from "./sortable-topic-item";
import { SortableActionItem } from "./sortable-action-item";

type TopicFormData = { category: string; title: string; notes: string; sortOrder: number };
type ActionFormData = { title: string; description: string; dueDate: string };

type Props = {
  memberId: string;
  initialTopics?: Array<{ category: string; title: string; notes: string; sortOrder: number }>;
};

function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function createEmptyAction(): ActionFormData {
  return { title: "", description: "", dueDate: "" };
}

export function MeetingForm({ memberId, initialTopics }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topics, setTopics] = useState<TopicFormData[]>(
    initialTopics && initialTopics.length > 0
      ? initialTopics.map((t) => ({ ...t, sortOrder: t.sortOrder }))
      : [createEmptyTopic(0)],
  );
  const [actionItems, setActionItems] = useState<ActionFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTopic(index: number, field: "category" | "title" | "notes", value: string) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function handleTopicDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTopics((prev) => {
      const oldIndex = prev.findIndex((_, i) => `topic-${i}` === active.id);
      const newIndex = prev.findIndex((_, i) => `topic-${i}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((t, i) => ({ ...t, sortOrder: i }));
    });
  }

  function addAction() {
    setActionItems((prev) => [...prev, createEmptyAction()]);
  }

  function removeAction(index: number) {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAction(index: number, field: "title" | "description" | "dueDate", value: string) {
    setActionItems((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function handleActionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setActionItems((prev) => {
      const oldIndex = prev.findIndex((_, i) => `action-${i}` === active.id);
      const newIndex = prev.findIndex((_, i) => `action-${i}` === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const validActions = actionItems.filter((a) => a.title.trim() !== "");

    try {
      const result = await createMeeting({
        memberId,
        date: new Date(date).toISOString(),
        topics: validTopics.map((t) => ({
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: validActions.map((a) => ({
          title: a.title,
          description: a.description,
          dueDate: a.dueDate || undefined,
        })),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/members/${memberId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  const topicIds = topics.map((_, i) => `topic-${i}`);
  const actionIds = actionItems.map((_, i) => `action-${i}`);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">日付 *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">話題</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTopic}>
              + 話題を追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTopicDragEnd}
          >
            <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
              {topics.map((topic, index) => (
                <SortableTopicItem
                  key={`topic-${index}`}
                  id={`topic-${index}`}
                  category={topic.category}
                  title={topic.title}
                  notes={topic.notes}
                  index={index}
                  showDelete={topics.length > 1}
                  onUpdate={updateTopic}
                  onRemove={removeTopic}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">アクションアイテム</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>
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
            onDragEnd={handleActionDragEnd}
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
                  onUpdate={updateAction}
                  onRemove={removeAction}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "保存中..." : "1on1を保存"}
      </Button>
    </form>
  );
}
