"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
import { toast } from "sonner";
import { createMeeting, updateMeeting } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import { SortableTopicItem } from "./sortable-topic-item";
import { SortableActionItem } from "./sortable-action-item";
import { screenReaderInstructions, createAnnouncements } from "@/lib/dnd-accessibility";

type TopicFormData = {
  id?: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

type ActionFormData = {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  dueDate: string;
};

type MeetingInitialData = {
  readonly meetingId: string;
  readonly date: string;
  readonly topics: ReadonlyArray<{
    readonly id: string;
    readonly category: string;
    readonly title: string;
    readonly notes: string;
    readonly sortOrder: number;
  }>;
  readonly actionItems: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly sortOrder: number;
    readonly dueDate: string;
    readonly status: string;
  }>;
};

type Props = {
  memberId: string;
  initialTopics?: Array<{ category: string; title: string; notes: string; sortOrder: number }>;
  initialData?: MeetingInitialData;
  onSuccess?: () => void;
};

function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function createEmptyAction(sortOrder: number): ActionFormData {
  return { title: "", description: "", sortOrder, dueDate: "" };
}

export function MeetingForm({ memberId, initialTopics, initialData, onSuccess }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [date, setDate] = useState(
    initialData
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );

  const [topics, setTopics] = useState<TopicFormData[]>(
    initialData
      ? initialData.topics.map((t) => ({
          id: t.id,
          category: t.category,
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        }))
      : initialTopics && initialTopics.length > 0
        ? initialTopics.map((t) => ({ ...t }))
        : [createEmptyTopic(0)],
  );

  const [actionItems, setActionItems] = useState<ActionFormData[]>(
    initialData
      ? initialData.actionItems.map((a, index) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          sortOrder: a.sortOrder ?? index,
          dueDate: a.dueDate,
        }))
      : [],
  );

  const [deletedTopicIds, setDeletedTopicIds] = useState<string[]>([]);
  const [deletedActionItemIds, setDeletedActionItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const topicAnnouncements = useMemo(() => createAnnouncements("話題"), []);
  const actionAnnouncements = useMemo(() => createAnnouncements("アクション"), []);

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => {
      const removed = prev[index];
      if (removed.id) {
        setDeletedTopicIds((ids) => [...ids, removed.id!]);
      }
      return prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i }));
    });
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
    setActionItems((prev) => [...prev, createEmptyAction(prev.length)]);
  }

  function removeAction(index: number) {
    setActionItems((prev) => {
      const removed = prev[index];
      if (removed.id) {
        setDeletedActionItemIds((ids) => [...ids, removed.id!]);
      }
      return prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, sortOrder: i }));
    });
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
      return arrayMove(prev, oldIndex, newIndex).map((a, i) => ({ ...a, sortOrder: i }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const validActions = actionItems.filter((a) => a.title.trim() !== "");

    try {
      if (isEditing) {
        const result = await updateMeeting({
          meetingId: initialData!.meetingId,
          date: new Date(date).toISOString(),
          topics: validTopics.map((t) => ({
            id: t.id,
            category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
            title: t.title,
            notes: t.notes,
            sortOrder: t.sortOrder,
          })),
          actionItems: validActions.map((a, index) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            sortOrder: a.sortOrder ?? index,
            dueDate: a.dueDate || undefined,
          })),
          deletedTopicIds,
          deletedActionItemIds,
        });
        if (!result.success) {
          setError(result.error);
          toast.error(TOAST_MESSAGES.meeting.updateError);
          return;
        }
        toast.success(TOAST_MESSAGES.meeting.updateSuccess);
        onSuccess?.();
      } else {
        const result = await createMeeting({
          memberId,
          date: new Date(date).toISOString(),
          topics: validTopics.map((t) => ({
            category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
            title: t.title,
            notes: t.notes,
            sortOrder: t.sortOrder,
          })),
          actionItems: validActions.map((a, index) => ({
            title: a.title,
            description: a.description,
            sortOrder: a.sortOrder ?? index,
            dueDate: a.dueDate || undefined,
          })),
        });
        if (!result.success) {
          setError(result.error);
          toast.error(TOAST_MESSAGES.meeting.createError);
          return;
        }
        toast.success(TOAST_MESSAGES.meeting.createSuccess);
        router.push(`/members/${memberId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
      setError(message);
      toast.error(message);
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
            accessibility={{
              announcements: topicAnnouncements,
              screenReaderInstructions,
            }}
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
            accessibility={{
              announcements: actionAnnouncements,
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
        {isSubmitting
          ? isEditing
            ? "更新中..."
            : "保存中..."
          : isEditing
            ? "1on1を更新"
            : "1on1を保存"}
      </Button>
    </form>
  );
}
