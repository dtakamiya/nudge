"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MEETING_TEMPLATES, type MeetingTemplate } from "@/lib/meeting-templates";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (template: MeetingTemplate) => void;
  selectedId?: string;
};

export function TemplateSelector({ onSelect, selectedId }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MEETING_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template)}
          className={cn(
            "text-left rounded-lg border border-transparent transition-colors",
            selectedId === template.id && "border-primary ring-1 ring-primary",
          )}
        >
          <Card className="h-full hover:border-primary/50 border-transparent">
            <CardContent className="p-3">
              <p className="font-medium text-sm">{template.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
