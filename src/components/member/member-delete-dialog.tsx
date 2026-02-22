"use client";

import { Trash2 } from "lucide-react";
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
};

export function MemberDeleteDialog({ memberId, memberName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      toast.success(TOAST_MESSAGES.member.deleteSuccess);
      setOpen(false);
      router.push("/");
    } catch {
      setError("削除に失敗しました。もう一度お試しください。");
      toast.error(TOAST_MESSAGES.member.deleteError);
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-1.5" />
          削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>メンバーを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {memberName}
            のデータを削除します。関連するミーティング記録やアクションアイテムもすべて削除されます。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "削除中..." : "削除する"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
