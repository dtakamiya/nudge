"use client";

import { FileText, Pencil, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMeetingDetailPage } from "@/hooks/use-meeting-detail-page";
import type { MeetingSummaryMarkdownData } from "@/lib/meeting-summary-markdown";

import { CoachingSheet } from "../coaching/coaching-sheet";
import { MeetingForm } from "../form/meeting-form";
import { FocusModeIndicator } from "../recording/focus-mode-indicator";
import { RecordingMode } from "../recording/recording-mode";
import { MeetingDetail } from "./meeting-detail";
import { SummaryDialog } from "./summary-dialog";

type TagData = {
  readonly id?: string;
  readonly name: string;
  readonly color?: string;
};

type Topic = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly notes: string;
  readonly sortOrder: number;
  readonly tags?: ReadonlyArray<TagData>;
};

type ActionItem = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sortOrder: number;
  readonly status: string;
  readonly dueDate: Date | null;
  readonly meeting: { readonly date: Date };
  readonly tags?: ReadonlyArray<TagData>;
};

type PreviousConditions = {
  readonly health: number | null;
  readonly mood: number | null;
  readonly workload: number | null;
};

type Props = {
  readonly meetingId: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly date: Date;
  readonly mood?: number | null;
  readonly conditionHealth?: number | null;
  readonly conditionMood?: number | null;
  readonly conditionWorkload?: number | null;
  readonly checkinNote?: string | null;
  readonly topics: ReadonlyArray<Topic>;
  readonly actionItems: ReadonlyArray<ActionItem>;
  readonly startedAt?: Date | null;
  readonly endedAt?: Date | null;
  readonly previousConditions?: PreviousConditions;
};

export function MeetingDetailPageClient({
  meetingId,
  memberId,
  memberName,
  date,
  mood,
  conditionHealth,
  conditionMood,
  conditionWorkload,
  checkinNote,
  topics,
  actionItems,
  startedAt,
  endedAt,
  previousConditions,
}: Props) {
  const {
    isEditing,
    isRecording,
    isStarting,
    isSummaryDialogOpen,
    setIsEditing,
    setIsSummaryDialogOpen,
    handleEditSuccess,
    handleRecordingEnd,
    handleStartMeeting,
  } = useMeetingDetailPage({
    meetingId,
    memberName,
    date,
    topics,
    actionItems,
    startedAt,
    endedAt,
  });

  const summaryData: MeetingSummaryMarkdownData = {
    memberName,
    date,
    conditionHealth: conditionHealth ?? null,
    conditionMood: conditionMood ?? null,
    conditionWorkload: conditionWorkload ?? null,
    checkinNote: checkinNote ?? null,
    topics: topics.map((t) => ({
      category: t.category,
      title: t.title,
      notes: t.notes,
    })),
    actionItems: actionItems.map((a) => ({
      title: a.title,
      description: a.description,
      status: a.status,
      dueDate: a.dueDate,
    })),
    startedAt: startedAt ?? null,
    endedAt: endedAt ?? null,
  };

  if (isRecording) {
    return (
      <>
        <FocusModeIndicator />
        <RecordingMode
          meetingId={meetingId}
          startedAt={startedAt ?? new Date()}
          topics={topics.map((t) => ({
            id: t.id,
            category: t.category,
            title: t.title,
            notes: t.notes,
            sortOrder: t.sortOrder,
          }))}
          onEnd={handleRecordingEnd}
        />
        <CoachingSheet />
      </>
    );
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            キャンセル
          </Button>
        </div>
        <MeetingForm
          memberId={memberId}
          initialData={{
            meetingId,
            date: date.toISOString(),
            mood,
            conditionHealth,
            conditionMood,
            conditionWorkload,
            checkinNote: checkinNote ?? "",
            topics: topics.map((t) => ({
              id: t.id,
              category: t.category,
              title: t.title,
              notes: t.notes,
              sortOrder: t.sortOrder,
              tags: t.tags ? [...t.tags] : [],
            })),
            actionItems: actionItems.map((a) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              sortOrder: a.sortOrder,
              dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "",
              status: a.status,
              tags: a.tags ? [...a.tags] : [],
            })),
          }}
          previousConditions={previousConditions}
          onSuccess={handleEditSuccess}
        />
        <CoachingSheet />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2 print:hidden">
        {!startedAt && !endedAt && (
          <Button variant="default" size="sm" onClick={handleStartMeeting} disabled={isStarting}>
            <Play className="w-4 h-4 mr-1.5" />
            {isStarting ? "記録開始中..." : "記録を開始"}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setIsSummaryDialogOpen(true)}>
          <FileText className="w-4 h-4 mr-1.5" />
          サマリー生成
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="w-4 h-4 mr-1.5" />
          編集
        </Button>
      </div>
      <MeetingDetail
        meetingId={meetingId}
        memberId={memberId}
        date={date}
        mood={mood}
        conditionHealth={conditionHealth}
        conditionMood={conditionMood}
        conditionWorkload={conditionWorkload}
        checkinNote={checkinNote}
        topics={[...topics]}
        actionItems={[...actionItems]}
        startedAt={startedAt}
        endedAt={endedAt}
      />
      <SummaryDialog
        open={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        data={summaryData}
      />
      <CoachingSheet />
    </div>
  );
}
