"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeetingForm } from "@/hooks/use-meeting-form";

import { ActionListSection } from "./action-list-section";
import { CheckinSection } from "./checkin-section";
import { ClosingDialog } from "./closing-dialog";
import type { MeetingFormProps } from "./meeting-form.types";
import { MoodSelector } from "./mood-selector";
import { TopicListSection } from "./topic-list-section";

export function MeetingForm(props: MeetingFormProps) {
  const {
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
    validTopicCount,
    validActionCount,
    topicTitles,
    actionItemTitles,
    topicIds,
    actionIds,
    setDate,
    setMood,
    setCheckinNote,
    setShowClosingDialog,
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
    handleActionDragEnd,
    handleSubmit,
    handleClosingConfirm,
  } = useMeetingForm(props);

  const submitLabel = isSubmitting
    ? isEditing
      ? "更新中..."
      : "保存中..."
    : isEditing
      ? "1on1を更新"
      : "1on1を保存";

  return (
    <>
      <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor="date">日付 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>

        <CheckinSection
          conditionHealth={conditionHealth}
          conditionMood={conditionMood}
          conditionWorkload={conditionWorkload}
          checkinNote={checkinNote}
          previousConditionHealth={previousConditions?.health}
          previousConditionMood={previousConditions?.mood}
          previousConditionWorkload={previousConditions?.workload}
          onConditionChange={handleConditionChange}
          onCheckinNoteChange={setCheckinNote}
        />

        <div className="flex flex-col gap-2">
          <Label id="mood-label">ミーティングの雰囲気</Label>
          <div aria-labelledby="mood-label">
            <MoodSelector value={mood} onChange={setMood} />
          </div>
          {mood && (
            <p className="text-xs text-muted-foreground">
              選択をもう一度クリックすると解除できます
            </p>
          )}
        </div>

        <TopicListSection
          topics={topics}
          topicIds={topicIds}
          sensors={sensors}
          announcements={topicAnnouncements}
          onAdd={addTopic}
          onUpdate={updateTopic}
          onRemove={removeTopic}
          onTagsChange={updateTopicTags}
          onDragEnd={handleTopicDragEnd}
        />

        <ActionListSection
          actionItems={actionItems}
          actionIds={actionIds}
          sensors={sensors}
          announcements={actionAnnouncements}
          onAdd={addAction}
          onUpdate={updateAction}
          onRemove={removeAction}
          onTagsChange={updateActionTags}
          onDragEnd={handleActionDragEnd}
        />

        {error && (
          <div
            ref={errorRef}
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="sticky bottom-0 z-10 bg-background border-t pt-3 pb-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>

      <ClosingDialog
        open={showClosingDialog}
        onOpenChange={setShowClosingDialog}
        onConfirm={handleClosingConfirm}
        summaryProps={{
          date,
          conditionHealth,
          conditionMood,
          conditionWorkload,
          checkinNote,
          previousConditionHealth: previousConditions?.health,
          previousConditionMood: previousConditions?.mood,
          previousConditionWorkload: previousConditions?.workload,
          topicCount: validTopicCount,
          actionItemCount: validActionCount,
          topicTitles,
          actionItemTitles,
        }}
      />
    </>
  );
}
