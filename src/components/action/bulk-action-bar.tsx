"use client";

import { CheckCheck, CircleDot, Clock, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteActionItems,
  bulkUpdateActionItemStatus,
} from "@/lib/actions/action-item-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type Props = {
  selectedIds: Set<string>;
  onClearAll: () => void;
};

export function BulkActionBar({ selectedIds, onClearAll }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const count = selectedIds.size;

  if (count === 0) return null;

  function handleBulkStatus(status: string) {
    startTransition(async () => {
      const result = await bulkUpdateActionItemStatus(Array.from(selectedIds), status);
      if (result.success) {
        toast.success(TOAST_MESSAGES.actionItem.bulkStatusChangeSuccess(result.data.count));
        onClearAll();
        router.refresh();
      } else {
        toast.error(TOAST_MESSAGES.actionItem.bulkStatusChangeError);
      }
    });
  }

  function handleBulkDelete() {
    startTransition(async () => {
      const result = await bulkDeleteActionItems(Array.from(selectedIds));
      if (result.success) {
        toast.success(TOAST_MESSAGES.actionItem.bulkDeleteSuccess(result.data.count));
        onClearAll();
        router.refresh();
      } else {
        toast.error(TOAST_MESSAGES.actionItem.bulkDeleteError);
      }
      setDeleteOpen(false);
    });
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
      <div className="flex items-center gap-2 bg-background border rounded-xl shadow-lg px-4 py-3">
        <span className="text-sm font-medium text-foreground mr-1">{count}件選択中</span>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkStatus("TODO")}
          disabled={isPending}
          aria-label="選択アイテムを未着手に変更"
        >
          <Clock className="h-4 w-4 mr-1" />
          未着手
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkStatus("IN_PROGRESS")}
          disabled={isPending}
          aria-label="選択アイテムを進行中に変更"
        >
          <CircleDot className="h-4 w-4 mr-1" />
          進行中
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBulkStatus("DONE")}
          disabled={isPending}
          aria-label="選択アイテムを完了に変更"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          完了
        </Button>
        <div className="h-4 w-px bg-border mx-1" />
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
              aria-label="選択アイテムを削除"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{count}件のアクションアイテムを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。選択した{count}
                件のアクションアイテムが完全に削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="h-4 w-px bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClearAll}
          aria-label="選択を解除"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
