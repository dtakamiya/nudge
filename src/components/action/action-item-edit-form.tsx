"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateActionItem } from "@/lib/actions/action-item-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";
import type { ActionItemData } from "@/components/action/types";

type Props = {
  readonly actionItem: ActionItemData;
  readonly onSuccess: () => void;
};

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ActionItemEditForm({ actionItem, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(actionItem.status);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDateValue = formData.get("dueDate") as string;
    const dueDate = dueDateValue || null;

    try {
      const result = await updateActionItem(actionItem.id, {
        title,
        description,
        status,
        dueDate,
      });
      if (!result.success) {
        setError(result.error);
        toast.error(TOAST_MESSAGES.actionItem.updateError);
        return;
      }
      toast.success(TOAST_MESSAGES.actionItem.updateSuccess);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "予期しないエラーが発生しました";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={actionItem.title}
          placeholder="例: レビュー対応"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={actionItem.description}
          placeholder="例: 詳細な説明"
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">ステータス</Label>
        <Select value={status} onValueChange={(val) => setStatus(val as ActionItemData["status"])}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">未着手</SelectItem>
            <SelectItem value="IN_PROGRESS">進行中</SelectItem>
            <SelectItem value="DONE">完了</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="dueDate">期限日</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={formatDateForInput(actionItem.dueDate)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "更新中..." : "更新する"}
      </Button>
    </form>
  );
}
