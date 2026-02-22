"use client";

import { Pencil, SquareCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateActionItem, updateActionItemStatus } from "@/lib/actions/action-item-actions";
import { formatDate } from "@/lib/format";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type ActionItemRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
};

type EditFormState = {
  title: string;
  description: string;
  dueDate: string;
};

type Props = { actionItems: ActionItemRow[] };

export function ActionListFull({ actionItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    dueDate: "",
  });
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    actionItems,
    (currentItems, { id, status }: { id: string; status: string }) =>
      currentItems.map((item) => (item.id === id ? { ...item, status } : item)),
  );

  if (actionItems.length === 0) {
    return (
      <EmptyState
        icon={SquareCheck}
        title="アクションアイテムはありません"
        description="1on1でアクションアイテムを作成すると、ここに表示されます"
      />
    );
  }

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      setOptimisticItems({ id, status: newStatus });
      const result = await updateActionItemStatus(id, newStatus);
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

  return (
    <div className={`flex flex-col gap-3 ${isPending ? "opacity-80" : ""}`}>
      {optimisticItems.map((item) => (
        <Card key={item.id} className="hover:shadow-sm hover:border-[oklch(0.88_0.008_260)]">
          {editingId === item.id ? (
            <CardContent className="p-4 flex flex-col gap-3">
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
            </CardContent>
          ) : (
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select
                  value={item.status}
                  onValueChange={(val) => handleStatusChange(item.id, val)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">未着手</SelectItem>
                    <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                    <SelectItem value="DONE">完了</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <Link href={`/members/${item.member.id}`} className="hover:underline">
                      {item.member.name}
                    </Link>
                    {" ・ "}
                    {formatDate(item.meeting.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {item.dueDate && `期限: ${formatDate(item.dueDate)}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="編集"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
