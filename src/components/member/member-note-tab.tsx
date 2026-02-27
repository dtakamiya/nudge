"use client";

import { StickyNote } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { MemberNote } from "@/generated/prisma/client";
import { NOTE_CATEGORIES } from "@/lib/constants";

import { MemberNoteCard } from "./member-note-card";
import { MemberNoteForm } from "./member-note-form";

type FilterValue = "all" | "good" | "improvement" | "notice";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "すべて" },
  ...NOTE_CATEGORIES.map((c) => ({
    value: c.value as FilterValue,
    label: c.label,
  })),
];

type Props = {
  notes: MemberNote[];
  memberId: string;
};

export function MemberNoteTab({ notes, memberId }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [editingNote, setEditingNote] = useState<MemberNote | null>(null);

  const filteredNotes = filter === "all" ? notes : notes.filter((n) => n.category === filter);

  function handleEdit(note: MemberNote) {
    setEditingNote(note);
  }

  function handleCancelEdit() {
    setEditingNote(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <MemberNoteForm
        memberId={memberId}
        editingNote={editingNote}
        onCancelEdit={handleCancelEdit}
      />

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={notes.length === 0 ? "メモがありません" : "該当するメモがありません"}
          description={
            notes.length === 0
              ? "上のフォームからメンバーについての気づきを記録しましょう。"
              : "フィルター条件を変更してください。"
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotes.map((note) => (
            <MemberNoteCard key={note.id} note={note} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
