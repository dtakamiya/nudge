"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MemberForm } from "@/components/member/member-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MemberData = {
  readonly id: string;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
};

type Props = {
  readonly member: MemberData;
};

export function MemberEditDialog({ member }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-1.5" />
          編集
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            メンバー情報の編集
          </DialogTitle>
          <DialogDescription>名前、部署、役職を変更できます。</DialogDescription>
        </DialogHeader>
        <MemberForm initialData={member} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
