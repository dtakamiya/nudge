"use client";

import { Circle, Clock } from "lucide-react";
import Link from "next/link";

import { DueDateBadge } from "@/components/action/due-date-badge";
import type { ActionItemStatusType } from "@/lib/validations/action-item";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type TaskItemRowProps = {
  readonly title: string;
  readonly status: ActionItemStatusType;
  readonly dueDate: Date | null;
  readonly memberId: string;
  readonly meetingId: string;
  readonly tags: Tag[];
};

export function TaskItemRow({
  title,
  status,
  dueDate,
  memberId,
  meetingId,
  tags,
}: TaskItemRowProps) {
  const StatusIcon = status === "IN_PROGRESS" ? Clock : Circle;

  return (
    <Link
      href={`/members/${memberId}/meetings/${meetingId}`}
      className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors duration-150 rounded-lg group"
    >
      <StatusIcon
        className={`w-4 h-4 mt-0.5 shrink-0 ${
          status === "IN_PROGRESS" ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {dueDate && (
        <div className="shrink-0">
          <DueDateBadge dueDate={dueDate} status={status} />
        </div>
      )}
    </Link>
  );
}
