"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MeetingSummary, type MeetingSummaryProps } from "../detail/meeting-summary";

interface ClosingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  summaryProps: MeetingSummaryProps;
}

export function ClosingDialog({ open, onOpenChange, onConfirm, summaryProps }: ClosingDialogProps) {
  const hasNoAction = summaryProps.actionItemCount === 0;

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ミーティングを保存しますか？</DialogTitle>
          <DialogDescription>保存前にミーティング内容をご確認ください。</DialogDescription>
        </DialogHeader>

        <MeetingSummary {...summaryProps} showWarnings={false} />

        {hasNoAction && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            アクションアイテムを設定すると次回の1on1がより効果的になります
          </p>
        )}

        <DialogFooter>
          {hasNoAction ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                戻って追加する
              </Button>
              <Button onClick={onConfirm}>アクションなしで保存</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                戻る
              </Button>
              <Button onClick={onConfirm}>保存する</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
