"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MemberItem = {
  readonly id: string;
  readonly name: string;
};

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly members: ReadonlyArray<MemberItem>;
};

export function NewMeetingDialog({ open, onClose, members }: Props) {
  const router = useRouter();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? "");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCreate = () => {
    if (!selectedMemberId) return;
    setIsNavigating(true);
    onClose();
    router.push(`/members/${selectedMemberId}/meetings/new`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm" aria-busy={isNavigating}>
        <DialogHeader>
          <DialogTitle className="font-semibold tracking-tight">新規ミーティングを作成</DialogTitle>
          <DialogDescription>ミーティングを作成するメンバーを選択してください。</DialogDescription>
        </DialogHeader>

        {members.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            <p>メンバーがいません</p>
            <Link
              href="/members/new"
              className="mt-2 block text-primary underline-offset-4 hover:underline"
            >
              メンバーを追加する
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="member-select" className="text-sm font-medium">
              メンバー
            </label>
            <select
              id="member-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          {members.length > 0 && (
            <Button onClick={handleCreate} disabled={!selectedMemberId || isNavigating}>
              {isNavigating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              作成
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
