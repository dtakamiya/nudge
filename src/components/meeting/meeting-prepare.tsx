"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateSelector } from "@/components/meeting/template-selector";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { MeetingTemplate, TopicCategory } from "@/lib/meeting-templates";

type TopicDraft = {
  category: TopicCategory;
  title: string;
  notes: string;
  sortOrder: number;
};

type PreviousTopic = { id: string; category: string; title: string; notes: string };
type PreviousMeetingData = {
  id: string;
  date: Date;
  topics: PreviousTopic[];
  actionItems: { id: string; title: string; status: string; dueDate: Date | null }[];
} | null;

type PendingAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  memberId: string;
  previousMeeting: PreviousMeetingData;
  pendingActions: PendingAction[];
};

const categoryOptions = [
  { value: "WORK_PROGRESS", label: "業務進捗" },
  { value: "CAREER", label: "キャリア" },
  { value: "ISSUES", label: "課題・相談" },
  { value: "FEEDBACK", label: "フィードバック" },
  { value: "OTHER", label: "その他" },
];

function createEmptyTopic(sortOrder: number): TopicDraft {
  return { category: "WORK_PROGRESS", title: "", notes: "", sortOrder };
}

export function MeetingPrepare({ memberId, previousMeeting, pendingActions }: Props) {
  const [topics, setTopics] = useState<TopicDraft[]>([createEmptyTopic(0)]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();

  function handleTemplateSelect(template: MeetingTemplate) {
    setSelectedTemplateId(template.id);
    if (template.topics.length === 0) {
      setTopics([createEmptyTopic(0)]);
    } else {
      setTopics(
        template.topics.map((t, i) => ({
          category: t.category,
          title: t.title,
          notes: "",
          sortOrder: i,
        })),
      );
    }
  }

  function addTopic() {
    setTopics((prev) => [...prev, createEmptyTopic(prev.length)]);
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index).map((t, i) => ({ ...t, sortOrder: i })));
  }

  function updateTopic(index: number, field: keyof TopicDraft, value: string | number) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function buildStartUrl(): string {
    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const params = new URLSearchParams();
    if (validTopics.length > 0) {
      params.set("preparedTopics", JSON.stringify(validTopics));
    }
    const query = params.toString();
    return `/members/${memberId}/meetings/new${query ? `?${query}` : ""}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: Previous meeting review */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {previousMeeting ? `前回: ${formatDate(previousMeeting.date)}` : "前回のミーティング"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!previousMeeting ? (
              <p className="text-sm text-muted-foreground">前回の記録はありません</p>
            ) : (
              <div className="flex flex-col gap-3">
                {previousMeeting.topics.map((topic) => (
                  <div key={topic.id}>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[topic.category] ?? topic.category}
                      </Badge>
                      <span className="text-sm font-medium">{topic.title}</span>
                    </div>
                    {topic.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{topic.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">未完了アクション</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">なし</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-center gap-2 text-sm">
                    <Badge
                      variant={action.status === "IN_PROGRESS" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {action.status === "IN_PROGRESS" ? "進行中" : "未着手"}
                    </Badge>
                    <span>{action.title}</span>
                    {action.dueDate && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDate(action.dueDate)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column: Agenda preparation */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium mb-3">テンプレート</h3>
          <TemplateSelector onSelect={handleTemplateSelect} selectedId={selectedTemplateId} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">アジェンダ</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addTopic}>
                + 話題を追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topics.map((topic, index) => (
              <div key={index} className="border rounded p-3 flex flex-col gap-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>カテゴリ</Label>
                    <Select
                      value={topic.category}
                      onValueChange={(val) => updateTopic(index, "category", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2]">
                    <Label>タイトル</Label>
                    <Input
                      value={topic.title}
                      onChange={(e) => updateTopic(index, "title", e.target.value)}
                      placeholder="話題のタイトル"
                    />
                  </div>
                  {topics.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopic(index)}
                    >
                      削除
                    </Button>
                  )}
                </div>
                <div>
                  <Label>メモ</Label>
                  <Textarea
                    value={topic.notes}
                    onChange={(e) => updateTopic(index, "notes", e.target.value)}
                    placeholder="事前メモ（任意）"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link href={buildStartUrl()}>
          <Button className="w-full">ミーティングを開始 →</Button>
        </Link>
      </div>
    </div>
  );
}
