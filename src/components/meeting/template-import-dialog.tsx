"use client";

import { Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { importTemplates, previewImport } from "@/lib/actions/template-actions";
import { readTemplateFile } from "@/lib/template-io";
import type { TemplateExportFile, TemplateExportItem } from "@/lib/validations/template-schema";

type Step = "select" | "preview" | "importing";

type PreviewState = {
  templates: TemplateExportItem[];
  duplicateNames: string[];
  overwriteNames: Set<string>;
};

type Props = {
  trigger: React.ReactNode;
};

export function TemplateImportDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [parsedFile, setParsedFile] = useState<TemplateExportFile | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("select");
    setError(null);
    setPreview(null);
    setParsedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const data = await readTemplateFile(file);
      setParsedFile(data);

      const result = await previewImport(data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPreview({
        templates: result.data.templates,
        duplicateNames: result.data.duplicateNames,
        overwriteNames: new Set(result.data.duplicateNames),
      });
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ファイルの読み込みに失敗しました");
    }
  }

  function toggleOverwrite(name: string) {
    if (!preview) return;
    setPreview((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.overwriteNames);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return { ...prev, overwriteNames: next };
    });
  }

  function handleImport() {
    if (!parsedFile || !preview) return;
    startTransition(async () => {
      const result = await importTemplates(parsedFile, Array.from(preview.overwriteNames));
      if (result.success) {
        const { created, updated, skipped } = result.data;
        const parts: string[] = [];
        if (created > 0) parts.push(`${created}件を新規作成`);
        if (updated > 0) parts.push(`${updated}件を更新`);
        if (skipped > 0) parts.push(`${skipped}件をスキップ`);
        toast.success(`インポート完了: ${parts.join("、")}`);
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const newCount = preview
    ? preview.templates.filter((t) => !preview.duplicateNames.includes(t.name)).length
    : 0;
  const duplicateCount = preview ? preview.duplicateNames.length : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>テンプレートをインポート</DialogTitle>
          <DialogDescription>
            NudgeでエクスポートしたテンプレートのJSONファイルを読み込みます。
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="flex flex-col gap-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">JSONファイルを選択</p>
              <p className="text-xs text-muted-foreground mt-1">クリックしてファイルを選択</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
                aria-label="インポートするJSONファイルを選択"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {step === "preview" && preview && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
              {newCount > 0 && <Badge variant="secondary">{newCount}件を新規作成</Badge>}
              {duplicateCount > 0 && <Badge variant="outline">{duplicateCount}件が重複</Badge>}
            </div>

            <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
              {preview.templates.map((t) => {
                const isDuplicate = preview.duplicateNames.includes(t.name);
                return (
                  <div key={t.name} className="flex items-start gap-3 border rounded p-3">
                    {isDuplicate ? (
                      <Checkbox
                        id={`overwrite-${t.name}`}
                        checked={preview.overwriteNames.has(t.name)}
                        onCheckedChange={() => toggleOverwrite(t.name)}
                        className="mt-0.5"
                      />
                    ) : (
                      <div className="w-4 h-4 mt-0.5 rounded-sm border border-primary bg-primary flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={isDuplicate ? `overwrite-${t.name}` : undefined}
                        className="font-medium text-sm cursor-pointer"
                      >
                        {t.name}
                        {isDuplicate && (
                          <span className="ml-2 text-xs text-amber-600 font-normal">
                            (既存のテンプレートを上書き)
                          </span>
                        )}
                      </Label>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {t.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        トピック {t.topics.length}件
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {duplicateCount > 0 && (
              <p className="text-xs text-muted-foreground">
                ※
                チェックを付けた既存テンプレートは説明・トピックが上書きされます（名前は変更されません）
              </p>
            )}
          </div>
        )}

        <DialogFooter showCloseButton>
          {step === "preview" && (
            <Button onClick={handleImport} disabled={isPending}>
              {isPending ? "インポート中..." : "インポート実行"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
