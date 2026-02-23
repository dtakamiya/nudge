"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
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
  memberId: string;
  startedAt: Date;
  topics: ReadonlyArray<Topic>;
  onEnd: () => void;
};

function buildInitialNotes(topics: ReadonlyArray<Topic>): Map<string, string> {
  return new Map(topics.map((t) => [t.id, t.notes ?? ""]));
}

export function RecordingMode({ meetingId, topics, startedAt, onEnd }: Props) {
  const [localNotes, setLocalNotes] = useState<Map<string, string>>(() =>
    buildInitialNotes(topics),
  );
  const [isEnding, setIsEnding] = useState(false);
  const isSavingRef = useRef(false);

  const debouncedNotes = useDebounce(localNotes, 500);

  useEffect(() => {
    if (isSavingRef.current) {
      return;
    }
    const saveAll = async () => {
      for (const [topicId, notes] of debouncedNotes.entries()) {
        const result = await updateTopicNotes({ topicId, notes });
        if (!result.success) {
          toast.error(TOAST_MESSAGES.meeting.autoSaveError);
        }
      }
    };
    saveAll();
  }, [debouncedNotes]);

  function handleNotesChange(topicId: string, notes: string) {
    setLocalNotes((prev) => {
      const next = new Map(prev);
      next.set(topicId, notes);
      return next;
    });
  }

  async function handleBlur(topicId: string) {
    isSavingRef.current = true;
    const notes = localNotes.get(topicId) ?? "";
    const result = await updateTopicNotes({ topicId, notes });
    if (!result.success) {
      toast.error(TOAST_MESSAGES.meeting.autoSaveError);
    }
    isSavingRef.current = false;
  }

  async function handleEnd() {
    setIsEnding(true);
    const result = await endMeeting({ meetingId });
    setIsEnding(false);
    if (result.success) {
      toast.success(TOAST_MESSAGES.meeting.recordingEnd);
      onEnd();
    } else {
      toast.error(TOAST_MESSAGES.meeting.recordingEndError);
    }
  }

  const sortedTopics = [...topics].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <ElapsedTimer startedAt={startedAt} />
        <Button variant="destructive" size="sm" onClick={handleEnd} disabled={isEnding}>
          ミーティングを終了する
        </Button>
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
