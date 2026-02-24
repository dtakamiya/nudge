"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { endMeeting, updateTopicNotes } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { ElapsedTimer } from "./elapsed-timer";
import { RecordingTopicItem } from "./recording-topic-item";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string | null;
  sortOrder: number;
};

type Props = {
  meetingId: string;
  startedAt: Date;
  topics: ReadonlyArray<Topic>;
  onEnd: () => void;
};

export function RecordingMode({ meetingId, startedAt, topics, onEnd }: Props) {
  const [localNotes, setLocalNotes] = useState<Map<string, string>>(
    () => new Map(topics.map((t) => [t.id, t.notes ?? ""])),
  );
  const [dirtyTopicIds, setDirtyTopicIds] = useState<Set<string>>(new Set());
  const [isEnding, setIsEnding] = useState(false);
  const debouncedNotes = useDebounce(localNotes, 500);
  const isFirstRender = useRef(true);
  const { isFocusMode, toggleFocusMode } = useFocusMode();

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
      for (const topicId of dirtyTopicIds) {
        const notes = debouncedNotes.get(topicId) ?? "";
        const result = await updateTopicNotes({ topicId, notes });
        if (!result.success) {
          toast.error(TOAST_MESSAGES.meeting.autoSaveError);
        }
      }
      setDirtyTopicIds(new Set());
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
    try {
      const result = await updateTopicNotes({ topicId, notes });
      if (!result.success) {
        toast.error(TOAST_MESSAGES.meeting.autoSaveError);
      }
    } catch {
      toast.error(TOAST_MESSAGES.meeting.autoSaveError);
    } finally {
      setDirtyTopicIds((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  }

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <ElapsedTimer startedAt={startedAt} />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFocusMode}
            aria-label="フォーカスモード切り替え (F)"
            title="フォーカスモード切り替え (F)"
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEnd} disabled={isEnding}>
            {isEnding ? "終了中..." : "ミーティングを終了する"}
          </Button>
        </div>
      </div>

      {sortedTopics.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          記録するトピックがありません
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedTopics.map((topic) => (
            <RecordingTopicItem
              key={topic.id}
              topic={{
                ...topic,
                notes: localNotes.get(topic.id) ?? topic.notes,
              }}
              onNotesChange={handleNotesChange}
              onBlur={handleBlur}
            />
          ))}
        </div>
      )}
    </div>
  );
}
