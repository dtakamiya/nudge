"use client";

import { Check, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MeetingTemplate as DbMeetingTemplate } from "@/generated/prisma/client";
import { MEETING_TEMPLATES, type MeetingTemplate } from "@/lib/meeting-templates";
import { cn } from "@/lib/utils";

type DbTemplateTopic = { category: string; title: string };

function parseDbTopics(raw: unknown): Array<DbTemplateTopic> {
  if (!Array.isArray(raw)) return [];
  return raw as Array<DbTemplateTopic>;
}

function toMeetingTemplate(db: DbMeetingTemplate): MeetingTemplate {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    topics: parseDbTopics(db.topics).map((t) => ({
      category: t.category as MeetingTemplate["topics"][number]["category"],
      title: t.title,
    })),
  };
}

type Props = {
  onSelect: (template: MeetingTemplate) => void;
  onAppend?: (template: MeetingTemplate) => void;
  selectedId?: string;
  customTemplates?: DbMeetingTemplate[];
};

export function TemplateSelector({ onSelect, onAppend, selectedId, customTemplates = [] }: Props) {
  const customConverted = customTemplates.map(toMeetingTemplate);
  const allTemplates = [...MEETING_TEMPLATES, ...customConverted];
  const customIds = new Set(customTemplates.map((t) => t.id));

  return (
    <div className="grid grid-cols-1 gap-2">
      {allTemplates.map((template) => {
        const isSelected = selectedId === template.id;
        const isCustom = customIds.has(template.id);
        return (
          <div
            key={template.id}
            className={cn(
              "rounded-lg border transition-colors",
              isSelected ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border",
            )}
          >
            <Card className="border-transparent bg-transparent shadow-none">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSelected && (
                        <Check
                          size={14}
                          className="text-primary shrink-0"
                          data-testid="template-check-icon"
                        />
                      )}
                      <p className="font-medium text-sm">{template.name}</p>
                      {isCustom && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                          カスタム
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {onAppend && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onAppend(template)}
                        aria-label={`${template.name}を追加`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        追加
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onSelect(template)}
                      aria-label={`${template.name}を適用`}
                    >
                      適用
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
