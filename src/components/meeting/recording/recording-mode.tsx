"use client";

import { Maximize2, Minimize2 } from "lucide-react";

import { QualityScoreDialog } from "@/components/meeting/quality/quality-score-dialog";
import { Button } from "@/components/ui/button";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { type Topic, useRecordingSession } from "@/hooks/use-recording-session";

import { AutoSaveIndicator } from "./auto-save-indicator";
import { ElapsedTimer } from "./elapsed-timer";
import { RecordingTopicItem } from "./recording-topic-item";

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
    showQualityDialog,
    handleNotesChange,
    handleBlur,
    handleRetry,
    handleSaveIdle,
    handleEndRequest,
    handleEndWithScores,
    handleSkipQuality,
  } = useRecordingSession({ meetingId, topics, onEnd });

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
        <ElapsedTimer startedAt={startedAt} />
        <AutoSaveIndicator status={saveStatus} onRetry={handleRetry} onIdle={handleSaveIdle} />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFocusMode}
            aria-label="フォーカスモード切り替え (F)"
            title="フォーカスモード切り替え (F)"
            className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndRequest}
            disabled={isEnding}
            className="min-h-[44px] md:min-h-0"
          >
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

      <QualityScoreDialog
        open={showQualityDialog}
        onSubmit={handleEndWithScores}
        onSkip={handleSkipQuality}
      />
    </div>
  );
}
