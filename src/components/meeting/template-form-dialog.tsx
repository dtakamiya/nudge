"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MeetingTemplate } from "@/generated/prisma/client";
import { createTemplate, updateTemplate } from "@/lib/actions/template-actions";
import type { TemplateTopicInput } from "@/lib/validations/template-schema";

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
] as const;

type TemplateTopic = TemplateTopicInput;

function parseTopics(raw: unknown): TemplateTopic[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t) => ({
    category: t.category ?? "WORK_PROGRESS",
    title: t.title ?? "",
  }));
}

type Props = {
  template?: MeetingTemplate;
  trigger: React.ReactNode;
};

export function TemplateFormDialog({ template, trigger }: Props) {
  const isEdit = Boolean(template);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [topics, setTopics] = useState<TemplateTopic[]>(
    template ? parseTopics(template.topics) : [],
  );
  const [isPending, startTransition] = useTransition();

  function addTopic() {
    setTopics((prev) => [...prev, { category: "WORK_PROGRESS", title: "" }]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTopicField(index: number, field: keyof TemplateTopic, value: string) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setName(template?.name ?? "");
      setDescription(template?.description ?? "");
      setTopics(template ? parseTopics(template.topics) : []);
    }
  }

  function handleSubmit() {
    const validTopics = topics.filter((t) => t.title.trim() !== "");
    startTransition(async () => {
      const input = { name: name.trim(), description: description.trim(), topics: validTopics };
      const result = isEdit
        ? await updateTemplate(template!.id, input)
        : await createTemplate(input);
      if (result.success) {
        toast.success(isEdit ? "テンプレートを更新しました" : "テンプレートを作成しました");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "テンプレートを編集" : "テンプレートを作成"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="template-name">テンプレート名 *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 週次チェックイン"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="template-description">説明</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このテンプレートの用途や特徴（任意）"
              rows={2}
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>トピック</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                <Plus className="w-3 h-3 mr-1" />
                追加
              </Button>
            </div>
            {topics.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                トピックなし（フリーテンプレート）
              </p>
            )}
            <div className="flex flex-col gap-2">
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-2 items-start border rounded p-2">
                  <div className="w-32 shrink-0">
                    <Select
                      value={topic.category}
                      onValueChange={(val) => updateTopicField(index, "category", val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={topic.title}
                    onChange={(e) => updateTopicField(index, "title", e.target.value)}
                    placeholder="トピックのタイトル"
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeTopic(index)}
                    aria-label="トピックを削除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={isPending || name.trim() === ""}>
            {isPending ? "保存中..." : isEdit ? "更新" : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
