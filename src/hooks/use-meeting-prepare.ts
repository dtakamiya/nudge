"use client";

import { type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import { toast } from "sonner";

import type { MeetingTemplate, TopicCategory } from "@/lib/meeting-templates";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

export type TopicDraft = {
  id: string;
  category: TopicCategory;
  title: string;
  notes: string;
  sortOrder: number;
};

function createDraftId(): string {
  return `draft-${crypto.randomUUID()}`;
}

function createEmptyTopic(sortOrder: number): TopicDraft {
  return { id: createDraftId(), category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function topicsFromTemplate(template: MeetingTemplate, startIndex: number): TopicDraft[] {
  if (template.topics.length === 0) return [createEmptyTopic(startIndex)];
  return template.topics.map((t, i) => ({
    id: createDraftId(),
    category: t.category,
    title: t.title,
    notes: "",
    sortOrder: startIndex + i,
  }));
}

export function useMeetingPrepare({ memberId }: { memberId: string }) {
  const [topics, setTopics] = useState<TopicDraft[]>([createEmptyTopic(0)]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [selectedFollowUpIds, setSelectedFollowUpIds] = useState<Set<string>>(new Set());
  const [isPendingActionsOpen, setIsPendingActionsOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const agendaRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleTemplateReplace(template: MeetingTemplate) {
    setSelectedTemplateId(template.id);
    setTopics(topicsFromTemplate(template, 0));
    toast.success(TOAST_MESSAGES.prepare.topicCopied);
    agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function appendTopicsFromTemplate(template: MeetingTemplate) {
    setTopics((prev) => {
      const newTopics = topicsFromTemplate(template, prev.length);
      return [...prev, ...newTopics].map((t, i) => ({ ...t, sortOrder: i }));
    });
    toast.success(TOAST_MESSAGES.prepare.topicCopied);
    agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

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
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((t, i) => ({ ...t, sortOrder: i }));
    });
  }

  function handleCarryoverToggle(id: string) {
    setSelectedFollowUpIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function buildStartUrl(): string {
    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const params = new URLSearchParams();
    if (validTopics.length > 0) {
      const topicsForUrl = validTopics.map(({ category, title, notes, sortOrder }) => ({
        category,
        title,
        notes,
        sortOrder,
      }));
      params.set("preparedTopics", JSON.stringify(topicsForUrl));
    }
    if (selectedFollowUpIds.size > 0) {
      params.set("followUpActionIds", JSON.stringify(Array.from(selectedFollowUpIds)));
    }
    const query = params.toString();
    return `/members/${memberId}/meetings/new${query ? `?${query}` : ""}`;
  }

  return {
    topics,
    selectedTemplateId,
    selectedFollowUpIds,
    isPendingActionsOpen,
    isTemplateOpen,
    agendaRef,
    sensors,
    setIsPendingActionsOpen,
    setIsTemplateOpen,
    handleTemplateReplace,
    appendTopicsFromTemplate,
    addTopic,
    removeTopic,
    updateTopic,
    handleTopicDragEnd,
    handleCarryoverToggle,
    buildStartUrl,
  };
}
