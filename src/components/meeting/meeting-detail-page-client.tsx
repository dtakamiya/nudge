"use client";

import { Pencil, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateMeeting } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { MeetingDetail } from "./meeting-detail";
import { MeetingForm } from "./meeting-form";
import { MeetingRecordMode } from "./meeting-record-mode";

type Topic = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly notes: string;
  readonly sortOrder: number;
};

type ActionItem = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sortOrder: number;
  readonly status: string;
  readonly dueDate: Date | null;
  readonly meeting: { readonly date: Date };
};

type Props = {
  readonly meetingId: string;
  readonly memberId: string;
  readonly date: Date;
  readonly startedAt?: Date | null;
  readonly endedAt?: Date | null;
  readonly topics: ReadonlyArray<Topic>;
  readonly actionItems: ReadonlyArray<ActionItem>;
};

export function MeetingDetailPageClient({
  meetingId,
  memberId,
  date,
  startedAt,
  endedAt,
  topics,
  actionItems,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(!!startedAt && !endedAt);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  function handleEditSuccess() {
    setIsEditing(false);
    toast.success(TOAST_MESSAGES.meeting.updateSuccess);
    router.refresh();
  }

  async function handleStartRecording() {
    setIsTransitioning(true);
    try {
      const now = new Date().toISOString();
      const result = await updateMeeting({
        meetingId,
        date: date.toISOString(),
        startedAt: now,
        topics: topics.map((t) => ({
          id: t.id,
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: actionItems.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          sortOrder: a.sortOrder,
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "",
        })),
      });
      if (result.success) {
        setIsRecording(true);
        toast.success("1on1の記録を開始しました");
        router.refresh();
      } else {
        toast.error("記録の開始に失敗しました");
      }
    } finally {
      setIsTransitioning(false);
    }
  }

  async function handleEndRecording() {
    setIsTransitioning(true);
    try {
      const now = new Date().toISOString();
      const result = await updateMeeting({
        meetingId,
        date: date.toISOString(),
        endedAt: now,
        topics: topics.map((t) => ({
          id: t.id,
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: actionItems.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          sortOrder: a.sortOrder,
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "",
        })),
      });
      if (result.success) {
        setIsRecording(false);
        toast.success("1on1の記録を終了しました");
        router.refresh();
      } else {
        toast.error("記録の終了に失敗しました");
      }
    } finally {
      setIsTransitioning(false);
    }
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
            topics: topics.map((t) => ({
              id: t.id,
              category: t.category,
              title: t.title,
              notes: t.notes,
              sortOrder: t.sortOrder,
            })),
            actionItems: actionItems.map((a) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              sortOrder: a.sortOrder,
              dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split("T")[0] : "",
              status: a.status,
            })),
          }}
          onSuccess={handleEditSuccess}
        />
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            記録中 (
            {startedAt
              ? new Date(startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "開始済"}
            )
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndRecording}
            disabled={isTransitioning}
          >
            <Square className="w-4 h-4 mr-1.5" />
            終了
          </Button>
        </div>
        <MeetingRecordMode topics={[...topics]} actionItems={[...actionItems]} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {endedAt ? (
          <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md flex items-center">
            所要時間:{" "}
            {startedAt && endedAt
              ? Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000)
              : "?"}{" "}
            分
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleStartRecording}
            disabled={isTransitioning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            ミーティングを開始
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="w-4 h-4 mr-1.5" />
          編集
        </Button>
      </div>
      <MeetingDetail date={date} topics={[...topics]} actionItems={[...actionItems]} />
    </div>
  );
}
