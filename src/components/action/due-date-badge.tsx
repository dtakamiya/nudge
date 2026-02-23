import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getDueDateStatus } from "@/lib/due-date";
import { formatDate } from "@/lib/format";

type Props = {
  dueDate: Date;
  status: string;
  size?: "sm" | "default";
};

export function DueDateBadge({ dueDate, status, size = "default" }: Props) {
  const dueDateStatus = getDueDateStatus(dueDate, status);
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (dueDateStatus === "overdue") {
    return (
      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
        <AlertTriangle className="h-3 w-3" />
        期限超過
      </Badge>
    );
  }
  if (dueDateStatus === "due-soon") {
    return (
      <Badge className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" />
        もうすぐ期限
      </Badge>
    );
  }
  return <span className={`${textClass} text-muted-foreground`}>期限: {formatDate(dueDate)}</span>;
}
