import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type TagBadgeProps = {
  name: string;
  color?: string;
  onRemove?: () => void;
  size?: "sm" | "md";
};

// hex カラーから rgba 背景色を生成する（opacity 20%）
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(99, 102, 241, ${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// デフォルトカラー（インディゴ）
const DEFAULT_COLOR = "#6366f1";

export function TagBadge({ name, color, onRemove, size = "md" }: TagBadgeProps) {
  const resolvedColor = color ?? DEFAULT_COLOR;
  const bgColor = hexToRgba(resolvedColor, 0.15);

  return (
    <span
      data-size={size}
      style={{
        backgroundColor: bgColor,
        color: resolvedColor,
        borderColor: hexToRgba(resolvedColor, 0.3),
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        "transition-all duration-200",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
      )}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          aria-label={`${name} を削除`}
          onClick={onRemove}
          className={cn(
            "rounded-full transition-opacity duration-150 ml-0.5",
            "hover:opacity-70 focus-visible:outline-none focus-visible:ring-1",
          )}
        >
          <X size={size === "sm" ? 10 : 12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
