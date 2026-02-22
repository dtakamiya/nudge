"use client";

import { useState } from "react";
import { Download, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getMeetingsForExport } from "@/lib/actions/export-actions";
import { formatMeetingMarkdown } from "@/lib/export";

type Props = {
  readonly memberId: string;
  readonly memberName: string;
};

export function ExportDialog({ memberId, memberName }: Props) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchMarkdown() {
    const result = await getMeetingsForExport({
      memberId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (!result.success) {
      toast.error("エクスポートに失敗しました");
      return null;
    }

    return formatMeetingMarkdown(result.data.member, result.data.meetings);
  }

  async function handleCopy() {
    setLoading(true);
    try {
      const markdown = await fetchMarkdown();
      if (!markdown) return;
      await navigator.clipboard.writeText(markdown);
      toast.success("クリップボードにコピーしました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const markdown = await fetchMarkdown();
      if (!markdown) return;

      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `1on1-${memberName}-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("ダウンロードしました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-1.5" />
          エクスポート
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ミーティングノートをエクスポート</DialogTitle>
          <DialogDescription>
            {memberName} の1on1ノートをMarkdown形式でエクスポートします。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">開始日</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">終了日</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            期間を指定しない場合はすべてのミーティングをエクスポートします。
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={loading}>
            <Copy className="w-4 h-4 mr-1.5" />
            クリップボードにコピー
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            <Download className="w-4 h-4 mr-1.5" />
            Markdownでダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
