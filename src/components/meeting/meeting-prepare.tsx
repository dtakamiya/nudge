"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PrepareActionChecklist } from "@/components/meeting/prepare-action-checklist";
import { PrepareTopicItem } from "@/components/meeting/prepare-topic-item";
import { PreviousMeetingReview } from "@/components/meeting/previous-meeting-review";
import { TemplateSelector } from "@/components/meeting/template-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { MeetingTemplate as DbMeetingTemplate } from "@/generated/prisma/client";
import type { MeetingTemplate, TopicCategory } from "@/lib/meeting-templates";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import { cn } from "@/lib/utils";

type TopicDraft = {
  id: string;
  category: TopicCategory;
  title: string;
  notes: string;
  sortOrder: number;
};

type PendingAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type LastMeetingData = {
  meetingId: string;
  meetingDate: Date;
  completedActions: { id: string; title: string; dueDate: Date | null }[];
  pendingActions: { id: string; title: string; status: string; dueDate: Date | null }[];
} | null;

type Props = {
  memberId: string;
  pendingActions: PendingAction[];
  lastMeetingData: LastMeetingData;
  customTemplates?: DbMeetingTemplate[];
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

export function MeetingPrepare({
  memberId,
  pendingActions,
  lastMeetingData,
  customTemplates = [],
}: Props) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: Previous meeting review & pending actions */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">前回の振り返り</CardTitle>
          </CardHeader>
          <CardContent>
            <PreviousMeetingReview
              data={lastMeetingData}
              selectedIds={selectedFollowUpIds}
              onToggle={handleCarryoverToggle}
            />
          </CardContent>
        </Card>

        {pendingActions.length > 0 && (
          <Collapsible open={isPendingActionsOpen} onOpenChange={setIsPendingActionsOpen}>
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full text-left"
                  >
                    <CardTitle className="text-sm font-medium">
                      未完了アクション全件
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({pendingActions.length}件)
                      </span>
                    </CardTitle>
                    {isPendingActionsOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <PrepareActionChecklist pendingActions={pendingActions} />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </div>

      {/* Right column: Agenda preparation */}
      <div className="flex flex-col gap-4">
        <Collapsible open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left"
                >
                  <CardTitle className="text-sm font-medium">テンプレートを適用</CardTitle>
                  {isTemplateOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <TemplateSelector
                  onSelect={handleTemplateReplace}
                  onAppend={appendTopicsFromTemplate}
                  selectedId={selectedTemplateId}
                  customTemplates={customTemplates}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div ref={agendaRef}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">アジェンダ</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                  + 話題を追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTopicDragEnd}
              >
                <SortableContext
                  items={topics.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={cn("flex flex-col gap-3")}>
                    {topics.map((topic, index) => (
                      <PrepareTopicItem
                        key={topic.id}
                        id={topic.id}
                        category={topic.category}
                        title={topic.title}
                        notes={topic.notes}
                        index={index}
                        showDelete={topics.length > 1}
                        onUpdate={updateTopic}
                        onRemove={removeTopic}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        <Link href={buildStartUrl()}>
          <Button className="w-full">記録を開始 →</Button>
        </Link>
      </div>
    </div>
  );
}
