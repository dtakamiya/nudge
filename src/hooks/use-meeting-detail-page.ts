"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useFocusMode } from "@/hooks/use-focus-mode";
import { startMeeting } from "@/lib/actions/meeting-actions";
import { generateMeetingSummaryText } from "@/lib/meeting-summary";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

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

export type UseMeetingDetailPageOptions = {
  meetingId: string;
  memberId: string;
  memberName: string;
  date: Date;
  mood?: number | null;
  conditionHealth?: number | null;
  conditionMood?: number | null;
  conditionWorkload?: number | null;
  checkinNote?: string | null;
  topics: ReadonlyArray<Topic>;
  actionItems: ReadonlyArray<ActionItem>;
  startedAt?: Date | null;
  endedAt?: Date | null;
};

export function useMeetingDetailPage(options: UseMeetingDetailPageOptions) {
  const { meetingId, memberName, date, topics, actionItems, startedAt, endedAt } = options;

  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(startedAt != null && endedAt == null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const { setFocusMode } = useFocusMode();

  function handleEditSuccess() {
    setIsEditing(false);
    router.refresh();
  }

  function handleRecordingEnd() {
    setFocusMode(false);
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

  async function handleCopySummary() {
    const summaryText = generateMeetingSummaryText({
      memberName,
      date,
      topics: topics.map((t) => ({ category: t.category, title: t.title, notes: t.notes })),
      actionItems: actionItems.map((a) => ({ title: a.title, dueDate: a.dueDate })),
      startedAt: startedAt ?? null,
      endedAt: endedAt ?? null,
    });
    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success(TOAST_MESSAGES.meeting.summaryCopied);
    } catch {
      toast.error(TOAST_MESSAGES.meeting.summaryCopyError);
    }
  }

  return {
    isEditing,
    isRecording,
    isStarting,
    setIsEditing,
    handleEditSuccess,
    handleRecordingEnd,
    handleStartMeeting,
    handleCopySummary,
  };
}
