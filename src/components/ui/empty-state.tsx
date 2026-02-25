import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type Props = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description?: string;
  readonly action?: EmptyStateAction;
  readonly secondaryAction?: EmptyStateAction;
  readonly size?: "compact" | "default" | "large";
  readonly variant?: "default" | "success";
};

const sizeClasses = {
  compact: "py-6",
  default: "py-10",
  large: "py-16",
} as const;

const iconSizeClasses = {
  compact: "w-8 h-8",
  default: "w-10 h-10",
  large: "w-12 h-12",
} as const;

const iconWrapperVariantClasses = {
  default: "bg-muted",
  success: "bg-[oklch(0.95_0.05_155)]",
} as const;

const iconVariantClasses = {
  default: "text-muted-foreground",
  success: "text-[oklch(0.35_0.1_155)]",
} as const;

function ActionButton({ action }: { readonly action: EmptyStateAction }) {
  if (action.href) {
    return (
      <Link href={action.href}>
        <Button size="sm">{action.label}</Button>
      </Link>
    );
  }
  return (
    <Button size="sm" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "default",
  variant = "default",
}: Props) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center", sizeClasses[size])}
      data-variant={variant}
    >
      <div className={cn("rounded-full p-3 mb-3", iconWrapperVariantClasses[variant])}>
        <Icon
          className={cn(iconSizeClasses[size], iconVariantClasses[variant])}
          strokeWidth={1.5}
        />
      </div>
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {(action ?? secondaryAction) && (
        <div className="mt-4 flex gap-2">
          {action && <ActionButton action={action} />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  );
}
