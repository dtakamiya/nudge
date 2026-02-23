"use client";

import { Pencil, Plus, SquareCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { DueDateBadge } from "@/components/action/due-date-badge";
import { TagBadge } from "@/components/tag/tag-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  createActionItemForMeeting,
  updateActionItem,
  updateActionItemStatus,
} from "@/lib/actions/action-item-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type TagData = {
  id: string;
  name: string;
  color: string;
};

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date } | null;
  tags?: TagData[];
};

type EditFormState = {
  title: string;
  description: string;
  dueDate: string;
};

type AddFormState = {
  title: string;
  dueDate: string;
};

type Props = {
  actionItems: ActionItemRow[];
  meetingId?: string;
  memberId?: string;
};

const statusLabels: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};
const statusColors: Record<string, "status-done" | "status-progress" | "status-todo"> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-progress",
  DONE: "status-done",
};

function nextStatus(current: string): string {
  return current === "TODO" ? "IN_PROGRESS" : current === "IN_PROGRESS" ? "DONE" : "TODO";
}

export function ActionListCompact({ actionItems, meetingId, memberId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    dueDate: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({ title: "", dueDate: "" });
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    actionItems,
    (currentItems, { id, status }: { id: string; status: string }) =>
      currentItems.map((item) => (item.id === id ? { ...item, status } : item)),
  );

  const canAdd = Boolean(meetingId && memberId);

  if (actionItems.length === 0 && !canAdd) {
    return <EmptyState icon={SquareCheck} title="アクションアイテムはありません" size="compact" />;
  }

  function cycleStatus(id: string, currentStatus: string) {
    const next = nextStatus(currentStatus);
    startTransition(async () => {
      setOptimisticItems({ id, status: next });
      const result = await updateActionItemStatus(id, next);
      if (!result.success) {
        toast.error(TOAST_MESSAGES.actionItem.statusChangeError);
      }
      router.refresh();
    });
  }

  function handleEdit(item: ActionItemRow) {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : "",
    });
  }

  function handleCancel() {
    setEditingId(null);
  }

  function handleSave() {
    if (!editingId) return;
    startTransition(async () => {
      const result = await updateActionItem(editingId, {
        title: editForm.title,
        description: editForm.description,
        dueDate: editForm.dueDate || undefined,
      });
      if (result.success) {
        toast.success(TOAST_MESSAGES.actionItem.updateSuccess);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(TOAST_MESSAGES.actionItem.updateError);
      }
    });
  }

  function handleAddSave() {
    if (!meetingId || !memberId) return;
    startTransition(async () => {
      const result = await createActionItemForMeeting(meetingId, memberId, {
        title: addForm.title,
        description: "",
        dueDate: addForm.dueDate || undefined,
      });
      if (result.success) {
        toast.success(TOAST_MESSAGES.actionItem.createSuccess);
        setShowAddForm(false);
        setAddForm({ title: "", dueDate: "" });
        router.refresh();
      } else {
        toast.error(TOAST_MESSAGES.actionItem.createError);
      }
    });
  }

  function handleAddCancel() {
    setShowAddForm(false);
    setAddForm({ title: "", dueDate: "" });
  }

  return (
    <div className={`flex flex-col gap-2 ${isPending ? "opacity-80" : ""}`}>
      {optimisticItems.length === 0 && canAdd && !showAddForm && (
        <p className="text-sm text-muted-foreground">アクションアイテムはありません</p>
      )}
      {optimisticItems.map((item) =>
        editingId === item.id ? (
          <div key={item.id} className="flex flex-col gap-2 p-2 border rounded">
            <div className="flex flex-col gap-2">
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="タイトル"
              />
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="説明"
              />
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!editForm.title.trim()}>
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => cycleStatus(item.id, item.status)}
                aria-label={`${item.title}のステータスを${statusLabels[nextStatus(item.status)]}に変更`}
              >
                <Badge variant={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-sm">{item.title}</span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {item.tags.map((tag) => (
                      <TagBadge key={tag.id} name={tag.name} color={tag.color} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.dueDate && (
                <DueDateBadge dueDate={item.dueDate} status={item.status} size="sm" />
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="編集"
                onClick={() => handleEdit(item)}
              >
                <Pencil />
              </Button>
            </div>
          </div>
        ),
      )}
      {showAddForm && (
        <div className="flex flex-col gap-2 p-2 border rounded animate-fade-in-up">
          <div className="flex flex-col gap-2">
            <Input
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              placeholder="アクションのタイトル"
              autoFocus
            />
            <Input
              type="date"
              value={addForm.dueDate}
              onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleAddCancel}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleAddSave} disabled={!addForm.title.trim()}>
              追加
            </Button>
          </div>
        </div>
      )}
      {canAdd && !showAddForm && (
        <div className="flex justify-end mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(true)}
            aria-label="アクション追加"
          >
            <Plus className="w-4 h-4 mr-1" />
            アクション追加
          </Button>
        </div>
      )}
    </div>
  );
}
