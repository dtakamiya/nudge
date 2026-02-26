"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { RecommendedMeeting } from "@/lib/types";

function DaysBadge({ member }: { member: RecommendedMeeting }) {
  if (member.lastMeetingDate === null) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-foreground">
        未実施
      </span>
    );
  }
  if (member.daysSinceLast > 21) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-foreground">
        {member.daysSinceLast} 日前
      </span>
    );
  }
  if (member.daysSinceLast > 14) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-foreground">
        {member.daysSinceLast} 日前
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      {member.daysSinceLast} 日前
    </span>
  );
}

function MemberRow({ member }: { member: RecommendedMeeting }) {
  return (
    <Link
      href={`/members/${member.id}`}
      className="flex items-center gap-3 py-2.5 hover:bg-muted/50 rounded-lg px-1 transition-colors"
    >
      <AvatarInitial name={member.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.name}</p>
        {member.department && <p className="text-xs text-muted-foreground">{member.department}</p>}
      </div>
      <DaysBadge member={member} />
    </Link>
  );
}

export function MeetingIntervalTable({ data }: { data: RecommendedMeeting[] }) {
  const [showNoMeeting, setShowNoMeeting] = useState(false);

  const activeMembers = data.filter((m) => m.lastMeetingDate !== null);
  const noMeetingMembers = data.filter((m) => m.lastMeetingDate === null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">メンバー別 最終1on1</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="メンバーが登録されていません"
            description="メンバーを追加すると、最終1on1の経過日数が表示されます"
            action={{ label: "メンバーを追加する", href: "/members/new" }}
            size="compact"
          />
        ) : (
          <>
            <div className="divide-y divide-border">
              {activeMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </div>

            {noMeetingMembers.length > 0 && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground w-full justify-start"
                  onClick={() => setShowNoMeeting((prev) => !prev)}
                >
                  {showNoMeeting
                    ? `▲ 未実施メンバーを折りたたむ`
                    : `▼ 未実施メンバーを表示（${noMeetingMembers.length}件）`}
                </Button>
                {showNoMeeting && (
                  <div className="divide-y divide-border mt-1">
                    {noMeetingMembers.map((member) => (
                      <MemberRow key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
