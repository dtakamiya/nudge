"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MemberNote } from "@/generated/prisma/client";
import { deleteMemberNote } from "@/lib/actions/member-note-actions";
import { getNoteCategoryLabel } from "@/lib/constants";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import { cn } from "@/lib/utils";

type Props = {
  note: MemberNote;
  onEdit: (note: MemberNote) => void;
};

const CATEGORY_STYLE: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  improvement: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  notice: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MemberNoteCard({ note, onEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMemberNote(note.id);
      if (result.success) {
        toast.success(TOAST_MESSAGES.note.deleteSuccess);
        router.refresh();
      } else {
        toast.error(TOAST_MESSAGES.note.deleteError);
      }
    });
  }

  return (
    <div
      className={cn(
        "border rounded-lg p-4 flex flex-col gap-2 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("shrink-0 text-xs", CATEGORY_STYLE[note.category])}>
              {getNoteCategoryLabel(note.category)}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(note)}
            aria-label="編集"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDelete}
              >
                削除
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                戻す
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="削除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
