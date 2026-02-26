"use client";

import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { ExportDialog } from "@/components/meeting/detail";
import { MemberDeleteDialog } from "@/components/member/member-delete-dialog";
import { MemberEditDialog } from "@/components/member/member-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MemberData = {
  readonly id: string;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
};

type Props = {
  readonly member: MemberData;
};

export function MemberActionsDropdown({ member }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <MemberDeleteDialog
        memberId={member.id}
        memberName={member.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <MemberEditDialog member={member} open={editOpen} onOpenChange={setEditOpen} />
      <ExportDialog
        memberId={member.id}
        memberName={member.name}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-1.5" />
            その他
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            編集
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExportOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            エクスポート
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
