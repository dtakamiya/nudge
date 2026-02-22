import Link from "next/link";
import type { LucideIcon } from "lucide-react";
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
  readonly size?: "compact" | "default" | "large";
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

export function EmptyState({ icon: Icon, title, description, action, size = "default" }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", sizeClasses[size])}>
      <div className="rounded-full bg-muted p-3 mb-3">
        <Icon className={cn("text-muted-foreground", iconSizeClasses[size])} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm">{action.label}</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
