"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ActionListCompact } from "@/components/action/action-list-compact";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { autoSaveTopicNote } from "@/lib/actions/meeting-actions";
import { CATEGORY_LABELS } from "@/lib/constants";

type Topic = {
  id: string;
  category: string;
  title: string;
  notes: string;
  sortOrder: number;
};

type ActionItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: Date | null;
  meeting: { date: Date };
};

type Props = {
  topics: Topic[];
  actionItems: ActionItem[];
};

export function MeetingRecordMode({ topics: initialTopics, actionItems }: Props) {
  const [topics, setTopics] = useState(initialTopics);

  const handleNotesChange = (topicId: string, notes: string) => {
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, notes } : t)));
  };

  const handleBlurOrSave = async (topicId: string, notes: string) => {
    try {
      const result = await autoSaveTopicNote({ topicId, notes });
      if (!result.success) {
        toast.error("ノートの保存に失敗しました");
      }
      // No success toast to avoid spamming the user during typing
    } catch {
      toast.error("ノートの保存に失敗しました");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">話題</h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">話題なし</p>
        ) : (
          <div className="flex flex-col gap-4">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {CATEGORY_LABELS[topic.category] ?? topic.category}
                    </Badge>
                    <span className="font-medium">{topic.title}</span>
                  </div>
                  <Textarea
                    placeholder="ノートを追加..."
                    value={topic.notes}
                    onChange={(e) => handleNotesChange(topic.id, e.target.value)}
                    onBlur={(e) => handleBlurOrSave(topic.id, e.target.value)}
                    className="min-h-[120px] resize-y"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Separator />
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">アクションアイテム</h2>
        <ActionListCompact
          actionItems={actionItems.map((a) => ({
            ...a,
            meeting: { date: a.meeting.date },
          }))}
        />
      </div>
    </div>
  );
}
