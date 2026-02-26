"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMeeting } from "@/lib/actions/meeting-actions";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type Props = {
  readonly meetingId: string;
  readonly memberId: string;
  readonly meetingDate: string;
};

export function MeetingHeaderActions({ meetingId, memberId, meetingDate }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteMeeting(meetingId);
      if (!result.success) {
        setError(result.error);
        toast.error(TOAST_MESSAGES.meeting.deleteError);
        setLoading(false);
        return;
      }
      toast.success(TOAST_MESSAGES.meeting.deleteSuccess);
      setDeleteDialogOpen(false);
      router.push(`/members/${memberId}`);
    } catch {
      setError("削除に失敗しました。もう一度お試しください。");
      toast.error(TOAST_MESSAGES.meeting.deleteError);
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="オプション">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ミーティングを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {meetingDate}
              のミーティング記録を削除します。関連する話題とアクションアイテムもすべて削除されます。この操作は取り消せません。
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
    </>
  );
}
