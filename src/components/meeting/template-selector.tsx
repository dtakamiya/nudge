"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  selectedId?: string;
  customTemplates?: DbMeetingTemplate[];
};

export function TemplateSelector({ onSelect, selectedId, customTemplates = [] }: Props) {
  const customConverted = customTemplates.map(toMeetingTemplate);
  const allTemplates = [...MEETING_TEMPLATES, ...customConverted];
  const customIds = new Set(customTemplates.map((t) => t.id));

  return (
    <div className="grid grid-cols-2 gap-3">
      {allTemplates.map((template) => {
        const isSelected = selectedId === template.id;
        const isCustom = customIds.has(template.id);
        return (
          <button
            key={template.id}
            type="button"
            aria-label={template.name}
            onClick={() => onSelect(template)}
            className={cn(
              "text-left rounded-lg border border-transparent transition-colors",
              isSelected && "border-primary ring-2 ring-primary bg-primary/10",
            )}
          >
            <Card
              className={cn(
                "h-full border-transparent",
                isSelected ? "" : "hover:border-primary/50",
              )}
            >
              <CardContent className="p-3 relative">
                {isSelected && (
                  <Check
                    size={16}
                    className="absolute top-2 right-2 text-primary"
                    data-testid="template-check-icon"
                  />
                )}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-medium text-sm">{template.name}</p>
                  {isCustom && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      カスタム
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
