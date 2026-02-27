"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MemberNote } from "@/generated/prisma/client";
import { createMemberNote, updateMemberNote } from "@/lib/actions/member-note-actions";
import { NOTE_CATEGORIES } from "@/lib/constants";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import { cn } from "@/lib/utils";

type Props = {
  memberId: string;
  editingNote?: MemberNote | null;
  onCancelEdit?: () => void;
};

export function MemberNoteForm({ memberId, editingNote, onCancelEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(editingNote?.content ?? "");
  const [category, setCategory] = useState(editingNote?.category ?? "good");

  useEffect(() => {
    if (editingNote) {
      setContent(editingNote.content);
      setCategory(editingNote.category);
    }
  }, [editingNote]);

  const isEditing = !!editingNote;
  const canSubmit = content.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    startTransition(async () => {
      if (isEditing && editingNote) {
        const result = await updateMemberNote(editingNote.id, {
          content: content.trim(),
          category,
        });
        if (result.success) {
          toast.success(TOAST_MESSAGES.note.updateSuccess);
          onCancelEdit?.();
          router.refresh();
        } else {
          toast.error(TOAST_MESSAGES.note.updateError);
        }
      } else {
        const result = await createMemberNote({
          memberId,
          content: content.trim(),
          category,
        });
        if (result.success) {
          toast.success(TOAST_MESSAGES.note.createSuccess);
          setContent("");
          setCategory("good");
          router.refresh();
        } else {
          toast.error(TOAST_MESSAGES.note.createError);
        }
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex gap-1">
        {NOTE_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            type="button"
            variant={category === cat.value ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="メモを入力..."
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        {isEditing && onCancelEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
            キャンセル
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          disabled={!canSubmit || isPending}
          onClick={handleSubmit}
          className={cn(isPending && "opacity-60")}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
