"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { Goal } from "@/generated/prisma/client";
import { createGoal, updateGoal } from "@/lib/actions/goal-actions";

type Props = {
  memberId: string;
  goal?: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function GoalForm({
  memberId,
  goal,
  onClose,
}: {
  memberId: string;
  goal?: Goal | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!goal;

  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [progress, setProgress] = useState(goal?.progress ?? 0);
  const [status, setStatus] = useState<string>(goal?.status ?? "IN_PROGRESS");
  const [dueDate, setDueDate] = useState(toDateInputValue(goal?.dueDate));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = {
        title,
        description,
        progress,
        status: status as "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
        dueDate: dueDate || undefined,
      };

      const result = isEditing
        ? await updateGoal(goal.id, input)
        : await createGoal(memberId, input);

      if (result.success) {
        toast.success(isEditing ? "目標を更新しました" : "目標を作成しました");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {isEditing ? "目標を編集" : "新しい目標を追加"}
        </DialogTitle>
        <DialogDescription>
          {isEditing ? "目標の内容を変更できます。" : "メンバーの成長目標を設定します。"}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-title">タイトル</Label>
          <Input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: TypeScriptの習得"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-description">説明</Label>
          <Textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="目標の詳細や背景..."
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>進捗: {progress}%</Label>
          <Slider
            value={[progress]}
            onValueChange={(v) => setProgress(v[0])}
            min={0}
            max={100}
            step={5}
            aria-label="進捗"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-status">ステータス</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="goal-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_PROGRESS">進行中</SelectItem>
              <SelectItem value="COMPLETED">完了</SelectItem>
              <SelectItem value="CANCELLED">キャンセル</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="goal-due-date">期限</Label>
          <Input
            id="goal-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : isEditing ? "更新" : "作成"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GoalFormDialog({ memberId, goal, open, onOpenChange }: Props) {
  const formKey = goal?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <GoalForm
            key={formKey}
            memberId={memberId}
            goal={goal}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
