"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateIcalContent } from "@/lib/ical";

type Props = {
  readonly memberName: string;
  readonly nextMeetingDate: Date | null;
};

export function CalendarExportButton({ memberName, nextMeetingDate }: Props) {
  const handleClick = () => {
    if (!nextMeetingDate) return;

    const content = generateIcalContent(memberName, nextMeetingDate);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `1on1-${memberName}.ics`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" disabled={!nextMeetingDate} onClick={handleClick}>
      <CalendarPlus className="w-4 h-4 mr-1.5" />
      カレンダーに追加
    </Button>
  );
}
