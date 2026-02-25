"use client";

import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { useRecordingSession } from "@/hooks/use-recording-session";

import { AutoSaveIndicator } from "./auto-save-indicator";
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
  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const {
    localNotes,
    sortedTopics,
    isEnding,
    saveStatus,
    handleNotesChange,
    handleBlur,
    handleRetry,
    handleSaveIdle,
    handleEnd,
  } = useRecordingSession({ meetingId, topics, onEnd });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <ElapsedTimer startedAt={startedAt} />
        <AutoSaveIndicator status={saveStatus} onRetry={handleRetry} onIdle={handleSaveIdle} />
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
