"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getMoodOption } from "@/lib/mood";

type AdjacentMeeting = {
  id: string;
  date: Date;
  mood: number | null;
};

type MeetingNavigationProps = {
  memberId: string;
  previous: AdjacentMeeting | null;
  next: AdjacentMeeting | null;
};

function isTypingTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || element.isContentEditable;
}

export function MeetingNavigation({ memberId, previous, next }: MeetingNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement)) return;
      if (e.key === "ArrowLeft" && previous) {
        e.preventDefault();
        router.push(`/members/${memberId}/meetings/${previous.id}`);
      }
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        router.push(`/members/${memberId}/meetings/${next.id}`);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [memberId, previous, next, router]);

  if (!previous && !next) return null;

  return (
    <div className="print:hidden flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
      <NavButton direction="previous" meeting={previous} memberId={memberId} router={router} />
      <NavButton direction="next" meeting={next} memberId={memberId} router={router} />
    </div>
  );
}

type NavButtonProps = {
  direction: "previous" | "next";
  meeting: AdjacentMeeting | null;
  memberId: string;
  router: ReturnType<typeof useRouter>;
};

function NavButton({ direction, meeting, memberId, router }: NavButtonProps) {
  const isPrevious = direction === "previous";
  const label = isPrevious ? "前回の1on1" : "次回の1on1";
  const emoji = getMoodOption(meeting?.mood ?? null)?.emoji;

  if (!meeting) {
    return (
      <div
        className={`flex items-center gap-1 text-muted-foreground/40 cursor-not-allowed select-none ${isPrevious ? "" : "ml-auto"}`}
      >
        {isPrevious && <ChevronLeft className="h-4 w-4" />}
        <span>{label}</span>
        {!isPrevious && <ChevronRight className="h-4 w-4" />}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 h-auto py-0.5 px-1.5 text-muted-foreground hover:text-foreground ${!isPrevious ? "ml-auto" : ""}`}
      onClick={() => router.push(`/members/${memberId}/meetings/${meeting.id}`)}
      title={`${label}（${isPrevious ? "← キー" : "→ キー"}）`}
    >
      {isPrevious && <ChevronLeft className="h-4 w-4" />}
      <span>
        {label}（{formatDate(meeting.date)}
        {emoji ? ` ${emoji}` : ""}）
      </span>
      {!isPrevious && <ChevronRight className="h-4 w-4" />}
    </Button>
  );
}
