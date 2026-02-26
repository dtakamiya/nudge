"use client";

import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useFocusMode } from "@/hooks/use-focus-mode";
import { cn } from "@/lib/utils";

import { MeetingHeaderActions } from "./meeting-header-actions";
import { PrintButton } from "./print-button";

interface MeetingDetailHeaderProps {
  readonly memberId: string;
  readonly memberName: string;
  readonly meetingId: string;
  readonly meetingDate: string;
}

export function MeetingDetailHeader({
  memberId,
  memberName,
  meetingId,
  meetingDate,
}: MeetingDetailHeaderProps) {
  const { isFocusMode } = useFocusMode();

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        isFocusMode ? "opacity-0 h-0 -translate-y-4" : "opacity-100",
      )}
      aria-hidden={isFocusMode}
    >
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: "ダッシュボード", href: "/" },
            { label: memberName, href: `/members/${memberId}` },
            { label: meetingDate },
          ]}
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {memberName}との1on1
        </h1>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <MeetingHeaderActions
            meetingId={meetingId}
            memberId={memberId}
            meetingDate={meetingDate}
          />
          <Link href={`/members/${memberId}`}>
            <Button variant="outline">戻る</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
