"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ActionSearchParams = {
  status?: string;
  memberId?: string;
  tag?: string;
  q?: string;
  dateFilter?: string;
  sort?: string;
};

type Props = {
  currentPage: number;
  totalPages: number;
  searchParams: ActionSearchParams;
};

function buildPageUrl(searchParams: ActionSearchParams, page: number): string {
  const p = new URLSearchParams();
  if (searchParams.status) p.set("status", searchParams.status);
  if (searchParams.memberId) p.set("memberId", searchParams.memberId);
  if (searchParams.tag) p.set("tag", searchParams.tag);
  if (searchParams.q) p.set("q", searchParams.q);
  if (searchParams.dateFilter) p.set("dateFilter", searchParams.dateFilter);
  if (searchParams.sort) p.set("sort", searchParams.sort);
  if (page > 1) p.set("page", String(page));
  const query = p.toString();
  return `/actions${query ? `?${query}` : ""}`;
}

export function ActionPagination({ currentPage, totalPages, searchParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button variant="outline" size="icon" asChild disabled={currentPage <= 1}>
        {currentPage <= 1 ? (
          <span aria-disabled="true">
            <ChevronLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link href={buildPageUrl(searchParams, currentPage - 1)} aria-label="前のページ">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
      </Button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="icon"
            asChild={p !== currentPage}
          >
            {p === currentPage ? (
              <span>{p}</span>
            ) : (
              <Link href={buildPageUrl(searchParams, p as number)} aria-label={`${p}ページ目`}>
                {p}
              </Link>
            )}
          </Button>
        ),
      )}

      <Button variant="outline" size="icon" asChild disabled={currentPage >= totalPages}>
        {currentPage >= totalPages ? (
          <span aria-disabled="true">
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link href={buildPageUrl(searchParams, currentPage + 1)} aria-label="次のページ">
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}

function buildPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);

  return pages;
}
