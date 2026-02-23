"use client";

import { Pencil, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startMeeting } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { CoachingSheet } from "./coaching-sheet";
import { MeetingDetail } from "./meeting-detail";
import { MeetingForm } from "./meeting-form";
import { RecordingMode } from "./recording-mode";

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

type Props = {
  readonly meetingId: string;
  readonly memberId: string;
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
};

export function MeetingDetailPageClient({
  meetingId,
  memberId,
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
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(startedAt != null && endedAt == null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  function handleEditSuccess() {
    setIsEditing(false);
    router.refresh();
  }

  function handleRecordingEnd() {
    setIsRecording(false);
    router.refresh();
  }

  async function handleStartMeeting() {
    setIsStarting(true);
    try {
      const result = await startMeeting({ meetingId });
      if (result.success) {
        toast.success(TOAST_MESSAGES.meeting.recordingStart);
        setIsRecording(true);
      } else {
        toast.error(TOAST_MESSAGES.meeting.recordingStartError);
      }
    } catch {
      toast.error(TOAST_MESSAGES.meeting.recordingStartError);
    } finally {
      setIsStarting(false);
    }
  }

  if (isRecording) {
    return (
      <>
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
          onSuccess={handleEditSuccess}
        />
        <CoachingSheet />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        {!startedAt && !endedAt && (
          <Button variant="default" size="sm" onClick={handleStartMeeting} disabled={isStarting}>
            <Play className="w-4 h-4 mr-1.5" />
            {isStarting ? "記録開始中..." : "記録を開始"}
          </Button>
        )}
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
      <CoachingSheet />
    </div>
  );
}
