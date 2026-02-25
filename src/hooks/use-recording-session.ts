"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { endMeeting, updateTopicNotes } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { useDebounce } from "./use-debounce";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string | null;
  sortOrder: number;
};

type UseRecordingSessionOptions = {
  meetingId: string;
  topics: ReadonlyArray<Topic>;
  onEnd: () => void;
};

export function useRecordingSession({ meetingId, topics, onEnd }: UseRecordingSessionOptions) {
  const [localNotes, setLocalNotes] = useState<Map<string, string>>(
    () => new Map(topics.map((t) => [t.id, t.notes ?? ""])),
  );
  const [dirtyTopicIds, setDirtyTopicIds] = useState<Set<string>>(new Set());
  const [isEnding, setIsEnding] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debouncedNotes = useDebounce(localNotes, 500);
  const isFirstRender = useRef(true);

  const sortedTopics = useMemo(
    () => [...topics].sort((a, b) => a.sortOrder - b.sortOrder),
    [topics],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (dirtyTopicIds.size === 0) return;

    async function saveAll() {
      setSaveStatus("saving");
      try {
        for (const topicId of dirtyTopicIds) {
          const notes = debouncedNotes.get(topicId) ?? "";
          const result = await updateTopicNotes({ topicId, notes });
          if (!result.success) {
            setSaveStatus("error");
            toast.error(TOAST_MESSAGES.meeting.autoSaveError);
            return;
          }
        }
        setSaveStatus("saved");
        setDirtyTopicIds(new Set());
      } catch {
        setSaveStatus("error");
        toast.error(TOAST_MESSAGES.meeting.autoSaveError);
      }
    }

    void saveAll();
  }, [debouncedNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNotesChange(topicId: string, notes: string) {
    setLocalNotes((prev) => {
      const next = new Map(prev);
      next.set(topicId, notes);
      return next;
    });
    setDirtyTopicIds((prev) => new Set(prev).add(topicId));
  }

  async function handleBlur(topicId: string) {
    const notes = localNotes.get(topicId) ?? "";
    setSaveStatus("saving");
    try {
      const result = await updateTopicNotes({ topicId, notes });
      if (!result.success) {
        setSaveStatus("error");
        toast.error(TOAST_MESSAGES.meeting.autoSaveError);
      } else {
        setSaveStatus("saved");
      }
    } catch {
      setSaveStatus("error");
      toast.error(TOAST_MESSAGES.meeting.autoSaveError);
    } finally {
      setDirtyTopicIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

  const handleRetry = useCallback(() => {
    setSaveStatus("idle");
  }, []);

  const handleSaveIdle = useCallback(() => {
    setSaveStatus("idle");
  }, []);

  async function handleEnd() {
    setIsEnding(true);
    try {
      const result = await endMeeting({ meetingId });
      if (result.success) {
        toast.success(TOAST_MESSAGES.meeting.recordingEnd);
        onEnd();
      } else {
        toast.error(TOAST_MESSAGES.meeting.recordingEndError);
      }
    } catch {
      toast.error(TOAST_MESSAGES.meeting.recordingEndError);
    } finally {
      setIsEnding(false);
    }
  }

  return {
    localNotes,
    sortedTopics,
    isEnding,
    saveStatus,
    handleNotesChange,
    handleBlur,
    handleRetry,
    handleSaveIdle,
    handleEnd,
  };
}
