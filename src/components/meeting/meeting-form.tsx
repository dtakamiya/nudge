"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMeeting } from "@/lib/actions/meeting-actions";

type TopicFormData = { category: string; title: string; notes: string; sortOrder: number };
type ActionFormData = { title: string; description: string; dueDate: string };

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
];

type Props = { memberId: string };

function createEmptyTopic(sortOrder: number): TopicFormData {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

function createEmptyAction(): ActionFormData {
  return { title: "", description: "", dueDate: "" };
}

export function MeetingForm({ memberId }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topics, setTopics] = useState<TopicFormData[]>([createEmptyTopic(0)]);
  const [actionItems, setActionItems] = useState<ActionFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTopic(index: number, field: keyof TopicFormData, value: string | number) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addAction() {
    setActionItems((prev) => [...prev, createEmptyAction()]);
  }

  function removeAction(index: number) {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAction(index: number, field: keyof ActionFormData, value: string) {
    setActionItems((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const validActions = actionItems.filter((a) => a.title.trim() !== "");

    try {
      await createMeeting({
        memberId,
        date: new Date(date).toISOString(),
        topics: validTopics.map((t) => ({
          category: t.category as "WORK_PROGRESS" | "CAREER" | "ISSUES" | "FEEDBACK" | "OTHER",
          title: t.title,
          notes: t.notes,
          sortOrder: t.sortOrder,
        })),
        actionItems: validActions.map((a) => ({
          title: a.title,
          description: a.description,
          dueDate: a.dueDate || undefined,
        })),
      });
      router.push(`/members/${memberId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="date">日付 *</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">話題</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTopic}>+ 話題を追加</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {topics.map((topic, index) => (
            <div key={index} className="border rounded p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>カテゴリ</Label>
                  <Select value={topic.category} onValueChange={(val) => updateTopic(index, "category", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2]">
                  <Label>タイトル</Label>
                  <Input value={topic.title} onChange={(e) => updateTopic(index, "title", e.target.value)} placeholder="話題のタイトル" />
                </div>
                {topics.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTopic(index)}>削除</Button>
                )}
              </div>
              <div>
                <Label>メモ</Label>
                <Textarea value={topic.notes} onChange={(e) => updateTopic(index, "notes", e.target.value)} placeholder="詳細メモ" rows={2} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">アクションアイテム</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAction}>+ アクション追加</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {actionItems.length === 0 && (<p className="text-sm text-gray-500">アクションはまだありません</p>)}
          {actionItems.map((action, index) => (
            <div key={index} className="border rounded p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <div className="flex-[2]">
                  <Label>タイトル</Label>
                  <Input value={action.title} onChange={(e) => updateAction(index, "title", e.target.value)} placeholder="アクションのタイトル" />
                </div>
                <div className="flex-1">
                  <Label>期限</Label>
                  <Input type="date" value={action.dueDate} onChange={(e) => updateAction(index, "dueDate", e.target.value)} />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAction(index)}>削除</Button>
              </div>
              <div>
                <Label>説明</Label>
                <Input value={action.description} onChange={(e) => updateAction(index, "description", e.target.value)} placeholder="詳細（任意）" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "保存中..." : "1on1を保存"}
      </Button>
    </form>
  );
}
