"use client";

import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type { ConditionField } from "@/components/meeting/checkin";
import {
  type ActionFormData,
  type ActionPriority,
  buildTagParams,
  createEmptyAction,
  createEmptyTopic,
  type MeetingFormProps,
  type TopicFormData,
} from "@/components/meeting/form";
import type { TagData } from "@/components/meeting/recording";
import { getActiveGoals } from "@/lib/actions/goal-actions";
import { createMeeting, updateMeeting } from "@/lib/actions/meeting-actions";
import { createAnnouncements, sortableKeyboardCoordinates } from "@/lib/dnd-accessibility";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

export function useMeetingForm({
  memberId,
  initialTopics,
  initialData,
  previousConditions,
  onSuccess,
}: MeetingFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [date, setDate] = useState(
    initialData ? new Date(initialData.date).toISOString().split("T")[0] : "",
  );

  useEffect(() => {
    if (!initialData) {
      setDate(new Date().toISOString().split("T")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [topics, setTopics] = useState<TopicFormData[]>(
    initialData
      ? initialData.topics.map((t) => ({
          id: t.id,
          category: t.category,
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
          tags: t.tags ? [...t.tags] : [],
        }))
      : initialTopics && initialTopics.length > 0
        ? initialTopics.map((t) => ({ ...t, tags: [] }))
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
          priority: (a.priority ?? "MEDIUM") as ActionPriority,
          goalId: a.goalId ?? null,
          tags: a.tags ? [...a.tags] : [],
        }))
      : [],
  );

  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchGoals() {
      const activeGoals = await getActiveGoals(memberId);
      if (!cancelled) {
        setGoals(activeGoals.map((g) => ({ id: g.id, title: g.title })));
      }
    }
    fetchGoals();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const [mood, setMood] = useState<number | null>(initialData?.mood ?? null);
  const [conditionHealth, setConditionHealth] = useState<number | null>(
    initialData?.conditionHealth ?? null,
  );
  const [conditionMood, setConditionMood] = useState<number | null>(
    initialData?.conditionMood ?? null,
  );
  const [conditionWorkload, setConditionWorkload] = useState<number | null>(
    initialData?.conditionWorkload ?? null,
  );
  const [checkinNote, setCheckinNote] = useState(initialData?.checkinNote ?? "");

  const [deletedTopicIds, setDeletedTopicIds] = useState<string[]>([]);
  const [deletedActionItemIds, setDeletedActionItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClosingDialog, setShowClosingDialog] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const topicAnnouncements = useMemo(() => createAnnouncements("話題"), []);
  const actionAnnouncements = useMemo(() => createAnnouncements("アクション"), []);

  function handleConditionChange(field: ConditionField, value: number | null) {
    if (field === "conditionHealth") setConditionHealth(value);
    else if (field === "conditionMood") setConditionMood(value);
    else setConditionWorkload(value);
  }

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

  function updateTopicTags(index: number, tags: TagData[]) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, tags } : t)));
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

  function updateActionTags(index: number, tags: TagData[]) {
    setActionItems((prev) => prev.map((a, i) => (i === index ? { ...a, tags } : a)));
  }

  function updateActionPriority(index: number, priority: ActionPriority) {
    setActionItems((prev) => prev.map((a, i) => (i === index ? { ...a, priority } : a)));
  }

  function updateActionGoal(index: number, goalId: string | null) {
    setActionItems((prev) => prev.map((item, i) => (i === index ? { ...item, goalId } : item)));
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

  async function executeSave() {
    setError(null);
    setIsSubmitting(true);

    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const validActions = actionItems.filter((a) => a.title.trim() !== "");

    try {
      if (isEditing) {
        const result = await updateMeeting({
          meetingId: initialData!.meetingId,
          date: new Date(date).toISOString(),
          mood,
          conditionHealth,
          conditionMood,
          conditionWorkload,
          checkinNote,
          topics: validTopics.map((t) => ({
            id: t.id,
            category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
            title: t.title,
            notes: t.notes,
            sortOrder: t.sortOrder,
            ...buildTagParams(t.tags),
          })),
          actionItems: validActions.map((a, index) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            sortOrder: a.sortOrder ?? index,
            dueDate: a.dueDate || undefined,
            priority: a.priority,
            goalId: a.goalId ?? null,
            ...buildTagParams(a.tags),
          })),
          deletedTopicIds,
          deletedActionItemIds,
        });
        if (!result.success) {
          setError(result.error);
          toast.error(TOAST_MESSAGES.meeting.updateError);
          setTimeout(
            () => errorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" }),
            0,
          );
          return;
        }
        toast.success(TOAST_MESSAGES.meeting.updateSuccess);
        onSuccess?.();
      } else {
        const result = await createMeeting({
          memberId,
          date: new Date(date).toISOString(),
          mood,
          conditionHealth,
          conditionMood,
          conditionWorkload,
          checkinNote,
          topics: validTopics.map((t) => ({
            category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
            title: t.title,
            notes: t.notes,
            sortOrder: t.sortOrder,
            ...buildTagParams(t.tags),
          })),
          actionItems: validActions.map((a, index) => ({
            title: a.title,
            description: a.description,
            sortOrder: a.sortOrder ?? index,
            dueDate: a.dueDate || undefined,
            priority: a.priority,
            goalId: a.goalId ?? null,
            ...buildTagParams(a.tags),
          })),
        });
        if (!result.success) {
          setError(result.error);
          toast.error(TOAST_MESSAGES.meeting.createError);
          setTimeout(
            () => errorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" }),
            0,
          );
          return;
        }
        toast.success(TOAST_MESSAGES.meeting.createSuccess);
        router.push(`/members/${memberId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
      setError(message);
      toast.error(message);
      setTimeout(
        () => errorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" }),
        0,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowClosingDialog(true);
  }

  async function handleClosingConfirm() {
    setShowClosingDialog(false);
    await executeSave();
  }

  const validTopics = topics.filter((t) => t.title.trim() !== "");
  const validActions = actionItems.filter((a) => a.title.trim() !== "");

  const categoryLabelMap: Record<string, string> = {
    WORK_PROGRESS: "業務進捗",
    CAREER: "キャリア",
    ISSUES: "課題・相談",
    FEEDBACK: "フィードバック",
    OTHER: "その他",
  };

  const topicTitles = validTopics.map((t) => {
    const label = categoryLabelMap[t.category] ?? t.category;
    return `${label} - ${t.title}`;
  });
  const actionItemTitles = validActions.map((a) => a.title);

  return {
    // state
    date,
    topics,
    actionItems,
    mood,
    conditionHealth,
    conditionMood,
    conditionWorkload,
    checkinNote,
    error,
    isSubmitting,
    isEditing,
    showClosingDialog,
    errorRef,
    sensors,
    topicAnnouncements,
    actionAnnouncements,
    previousConditions,
    // derived
    validTopicCount: validTopics.length,
    validActionCount: validActions.length,
    topicTitles,
    actionItemTitles,
    topicIds: topics.map((_, i) => `topic-${i}`),
    actionIds: actionItems.map((_, i) => `action-${i}`),
    // setters
    setDate,
    setMood,
    setCheckinNote,
    setShowClosingDialog,
    // handlers
    handleConditionChange,
    addTopic,
    removeTopic,
    updateTopic,
    updateTopicTags,
    handleTopicDragEnd,
    addAction,
    removeAction,
    updateAction,
    updateActionTags,
    updateActionPriority,
    updateActionGoal,
    goals,
    handleActionDragEnd,
    handleSubmit,
    handleClosingConfirm,
  };
}
