"use client";

import { Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import type { MeetingSummaryMarkdownData } from "@/lib/meeting-summary-markdown";
import {
  generateMeetingSummaryMarkdown,
  generateMeetingSummaryPlainText,
} from "@/lib/meeting-summary-markdown";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type Format = "markdown" | "plaintext";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly data: MeetingSummaryMarkdownData;
};

export function SummaryDialog({ open, onOpenChange, data }: Props) {
  const [format, setFormat] = useState<Format>("markdown");

  const summaryText = useMemo(() => {
    return format === "markdown"
      ? generateMeetingSummaryMarkdown(data)
      : generateMeetingSummaryPlainText(data);
  }, [data, format]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success(TOAST_MESSAGES.meeting.summaryCopied);
    } catch {
      toast.error(TOAST_MESSAGES.meeting.summaryCopyError);
    }
  }

  function handleDownload() {
    try {
      const ext = format === "markdown" ? "md" : "txt";
      const mimeType =
        format === "markdown" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
      const dateStr = formatDate(data.date).replace(/\//g, "-");
      const filename = `1on1-${data.memberName}-${dateStr}.${ext}`;

      const blob = new Blob([summaryText], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(TOAST_MESSAGES.meeting.summaryDownloaded);
    } catch {
      toast.error(TOAST_MESSAGES.meeting.summaryDownloadError);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ミーティングサマリー</DialogTitle>
          <DialogDescription>
            サマリーをコピーまたはダウンロードして共有できます。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-2">
          <Button
            variant={format === "markdown" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("markdown")}
          >
            Markdown
          </Button>
          <Button
            variant={format === "plaintext" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormat("plaintext")}
          >
            テキスト
          </Button>
        </div>

        <textarea
          readOnly
          value={summaryText}
          className="flex-1 min-h-[200px] max-h-[400px] w-full rounded-md border border-input bg-muted/50 p-3 text-sm font-mono resize-none focus:outline-none overflow-auto"
        />

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1.5" />
            コピー
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1.5" />
            ダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
