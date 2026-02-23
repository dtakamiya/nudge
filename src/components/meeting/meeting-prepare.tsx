"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { CarryoverActionList } from "@/components/meeting/carryover-action-list";
import { PastMeetingsAccordion } from "@/components/meeting/past-meetings-accordion";
import { PrepareActionChecklist } from "@/components/meeting/prepare-action-checklist";
import { TemplateSelector } from "@/components/meeting/template-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { MeetingTemplate, TopicCategory } from "@/lib/meeting-templates";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

type TopicDraft = {
  category: TopicCategory;
  title: string;
  notes: string;
  sortOrder: number;
};

type Topic = { id: string; category: string; title: string; notes: string };
type MeetingData = { id: string; date: Date; topics: Topic[]; actionItems: unknown[] };

type PendingAction = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type CarryoverActionItem = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
};

type CarryoverData = {
  meetingId: string;
  meetingDate: Date;
  actions: CarryoverActionItem[];
} | null;

type Props = {
  memberId: string;
  recentMeetings: MeetingData[];
  pendingActions: PendingAction[];
  carryoverData: CarryoverData;
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

export function MeetingPrepare({ memberId, recentMeetings, pendingActions, carryoverData }: Props) {
  const [topics, setTopics] = useState<TopicDraft[]>([createEmptyTopic(0)]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const agendaRef = useRef<HTMLDivElement>(null);
  const [selectedFollowUpIds, setSelectedFollowUpIds] = useState<Set<string>>(new Set());

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

  function handleCopyTopic(topic: Topic) {
    setTopics((prev) => [
      ...prev,
      {
        category: topic.category as TopicCategory,
        title: topic.title,
        notes: topic.notes,
        sortOrder: prev.length,
      },
    ]);
    toast.success(TOAST_MESSAGES.prepare.topicCopied);
    agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function handleCarryoverToggle(id: string) {
    setSelectedFollowUpIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function buildStartUrl(): string {
    const validTopics = topics.filter((t) => t.title.trim() !== "");
    const params = new URLSearchParams();
    if (validTopics.length > 0) {
      params.set("preparedTopics", JSON.stringify(validTopics));
    }
    if (selectedFollowUpIds.size > 0) {
      params.set("followUpActionIds", JSON.stringify(Array.from(selectedFollowUpIds)));
    }
    const query = params.toString();
    return `/members/${memberId}/meetings/new${query ? `?${query}` : ""}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left column: Previous meetings review & pending actions */}
      <div className="flex flex-col gap-4">
        {carryoverData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">前回からの引き継ぎ</CardTitle>
            </CardHeader>
            <CardContent>
              <CarryoverActionList
                meetingDate={carryoverData.meetingDate}
                actions={carryoverData.actions}
                selectedIds={selectedFollowUpIds}
                onToggle={handleCarryoverToggle}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">未完了アクション</CardTitle>
          </CardHeader>
          <CardContent>
            <PrepareActionChecklist pendingActions={pendingActions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">過去のミーティング</CardTitle>
          </CardHeader>
          <CardContent>
            <PastMeetingsAccordion meetings={recentMeetings} onCopyTopic={handleCopyTopic} />
          </CardContent>
        </Card>
      </div>

      {/* Right column: Agenda preparation */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium mb-3">テンプレート</h3>
          <TemplateSelector onSelect={handleTemplateSelect} selectedId={selectedTemplateId} />
        </div>

        <div ref={agendaRef}>
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
        </div>

        <Link href={buildStartUrl()}>
          <Button className="w-full">ミーティングを開始 →</Button>
        </Link>
      </div>
    </div>
  );
}
