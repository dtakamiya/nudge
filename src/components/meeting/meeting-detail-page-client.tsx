"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { MeetingDetail } from "./meeting-detail";
import { MeetingForm } from "./meeting-form";

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
  readonly topics: ReadonlyArray<Topic>;
  readonly actionItems: ReadonlyArray<ActionItem>;
};

export function MeetingDetailPageClient({ meetingId, memberId, date, topics, actionItems }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  function handleEditSuccess() {
    setIsEditing(false);
    toast.success(TOAST_MESSAGES.meeting.updateSuccess);
    router.refresh();
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="w-4 h-4 mr-1.5" />
          編集
        </Button>
      </div>
      <MeetingDetail date={date} topics={[...topics]} actionItems={[...actionItems]} />
    </div>
  );
}
