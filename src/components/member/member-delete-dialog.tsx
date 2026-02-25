"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteMember } from "@/lib/actions/member-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type Props = {
  readonly memberId: string;
  readonly memberName: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
};

export function MemberDeleteDialog({ memberId, memberName, open: openProp, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  function handleOpenChange(value: boolean) {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteMember(memberId);
      if (!result.success) {
        setError(result.error);
        toast.error(TOAST_MESSAGES.member.deleteError);
        setLoading(false);
        return;
      }
      handleOpenChange(false);
      router.push(`/?deleted=${encodeURIComponent(memberName)}`);
    } catch {
      setError("削除に失敗しました。もう一度お試しください。");
      toast.error(TOAST_MESSAGES.member.deleteError);
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild style={isControlled ? { display: "none" } : undefined}>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-1.5" />
          削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent aria-busy={loading}>
        <AlertDialogHeader>
          <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {memberName}
            のデータを削除します。関連するミーティング記録やアクションアイテムもすべて削除されます。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p
          role="alert"
          className="text-sm text-destructive"
          style={error ? undefined : { display: "none" }}
        >
          {error}
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "削除中..." : "削除する"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
