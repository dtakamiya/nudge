import type { PriorityType } from "@/lib/types";

type Props = {
  priority: PriorityType;
};

const PRIORITY_CONFIG: Record<PriorityType, { label: string; className: string }> = {
  HIGH: {
    label: "高",
    className: "text-red-700 bg-red-100 border border-red-200",
  },
  MEDIUM: {
    label: "中",
    className: "text-amber-700 bg-amber-100 border border-amber-200",
  },
  LOW: {
    label: "低",
    className: "text-green-700 bg-green-100 border border-green-200",
  },
};

export function PriorityBadge({ priority }: Props) {
  const { label, className } = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
