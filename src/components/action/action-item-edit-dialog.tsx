"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionItemEditForm } from "@/components/action/action-item-edit-form";
import type { ActionItemData } from "@/components/action/types";

type Props = {
  readonly actionItem: ActionItemData;
};

export function ActionItemEditDialog({ actionItem }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="w-4 h-4" />
          <span className="sr-only">編集</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            アクションアイテムの編集
          </DialogTitle>
          <DialogDescription>タイトル、説明、ステータス、期限日を変更できます。</DialogDescription>
        </DialogHeader>
        <ActionItemEditForm actionItem={actionItem} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
