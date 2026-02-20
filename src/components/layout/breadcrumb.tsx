import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

type Props = {
  readonly items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: Props) {
  return (
    <nav
      aria-label="パンくずリスト"
      className="flex items-center gap-1 text-xs text-muted-foreground mb-4"
    >
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors duration-150">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
