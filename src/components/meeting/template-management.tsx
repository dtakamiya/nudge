"use client";

import { Download, Edit2, Plus, Trash2, Upload } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MeetingTemplate } from "@/generated/prisma/client";
import { deleteTemplate, exportTemplates } from "@/lib/actions/template-actions";
import { downloadTemplatesAsJson } from "@/lib/template-io";

import { TemplateFormDialog } from "./template-form-dialog";
import { TemplateImportDialog } from "./template-import-dialog";

const categoryLabels: Record<string, string> = {
  WORK_PROGRESS: "業務進捗",
  CAREER: "キャリア",
  ISSUES: "課題・相談",
  FEEDBACK: "フィードバック",
  OTHER: "その他",
};

function parseTopics(raw: unknown): Array<{ category: string; title: string }> {
  if (!Array.isArray(raw)) return [];
  return raw as Array<{ category: string; title: string }>;
}

type TemplateCardProps = {
  template: MeetingTemplate;
};

function TemplateCard({ template }: TemplateCardProps) {
  const [isPending, startTransition] = useTransition();
  const topics = parseTopics(template.topics);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        toast.success("テンプレートを削除しました");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">{template.name}</CardTitle>
            {template.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <TemplateFormDialog
              template={template}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="編集">
                  <Edit2 className="w-3 h-3" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  aria-label="削除"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>テンプレートを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    「{template.name}」を削除します。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p className="text-xs text-muted-foreground">トピックなし</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {topics.map((topic, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {categoryLabels[topic.category] ?? topic.category}: {topic.title}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type Props = {
  templates: MeetingTemplate[];
};

export function TemplateManagement({ templates }: Props) {
  const [isExporting, startExportTransition] = useTransition();

  function handleExport() {
    startExportTransition(async () => {
      const result = await exportTemplates();
      if (result.success) {
        downloadTemplatesAsJson(result.data);
        toast.success("テンプレートをエクスポートしました");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">カスタムテンプレート</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            1on1 準備画面で使えるオリジナルテンプレートを作成できます
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || templates.length === 0}
            aria-label="テンプレートをエクスポート"
          >
            <Download className="w-4 h-4 mr-1" />
            エクスポート
          </Button>
          <TemplateImportDialog
            trigger={
              <Button variant="outline" size="sm" aria-label="テンプレートをインポート">
                <Upload className="w-4 h-4 mr-1" />
                インポート
              </Button>
            }
          />
          <TemplateFormDialog
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                新規作成
              </Button>
            }
          />
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">カスタムテンプレートがまだありません</p>
          <p className="text-xs text-muted-foreground mt-1">
            「新規作成」ボタンから作成してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
