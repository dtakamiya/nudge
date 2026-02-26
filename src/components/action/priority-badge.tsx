import { Badge } from "@/components/ui/badge";
import type { PriorityType } from "@/lib/types";

type Props = {
  priority: PriorityType;
};

const PRIORITY_CONFIG: Record<PriorityType, { label: string; className: string }> = {
  HIGH: {
    label: "高",
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
  MEDIUM: {
    label: "中",
    className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  LOW: {
    label: "低",
    className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
  },
};

export function PriorityBadge({ priority }: Props) {
  const { label, className } = PRIORITY_CONFIG[priority];
  return <Badge className={className}>{label}</Badge>;
}
