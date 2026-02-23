"use client";

import { Check } from "lucide-react";

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
      {MEETING_TEMPLATES.map((template) => {
        const isSelected = selectedId === template.id;
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
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
