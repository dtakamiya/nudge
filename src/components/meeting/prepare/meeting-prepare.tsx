"use client";

import { closestCenter, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Goal, MeetingTemplate as DbMeetingTemplate } from "@/generated/prisma/client";
import { useMeetingPrepare } from "@/hooks/use-meeting-prepare";
import { screenReaderInstructions } from "@/lib/dnd-accessibility";
import { cn } from "@/lib/utils";

import { TemplateSelector } from "../template/template-selector";
import { PrepareActionChecklist } from "./prepare-action-checklist";
import { PrepareGoalsSection } from "./prepare-goals-section";
import { PrepareTopicItem } from "./prepare-topic-item";
import { PreviousMeetingReview } from "./previous-meeting-review";

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
  activeGoals?: Goal[];
};

export function MeetingPrepare({
  memberId,
  pendingActions,
  lastMeetingData,
  customTemplates = [],
  activeGoals = [],
}: Props) {
  const {
    topics,
    selectedTemplateId,
    selectedFollowUpIds,
    isPendingActionsOpen,
    isTemplateOpen,
    agendaRef,
    sensors,
    agendaAnnouncements,
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
  } = useMeetingPrepare({ memberId });

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

        {activeGoals.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                進行中の目標
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({activeGoals.length}件)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PrepareGoalsSection goals={activeGoals} />
            </CardContent>
          </Card>
        )}

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
                accessibility={{
                  announcements: agendaAnnouncements,
                  screenReaderInstructions,
                }}
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
