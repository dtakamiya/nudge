import Link from "next/link";

import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecommendedMeeting } from "@/lib/actions/analytics-actions";

export function MeetingIntervalTable({ data }: { data: RecommendedMeeting[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">メンバー別 最終1on1</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">データがありません</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="flex items-center gap-3 py-2.5 hover:bg-muted/50 rounded-lg px-1 transition-colors"
              >
                <AvatarInitial name={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  {member.department && (
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    member.lastMeetingDate === null
                      ? "bg-destructive/10 text-destructive"
                      : member.daysSinceLast > 21
                        ? "bg-destructive/10 text-destructive"
                        : member.daysSinceLast > 14
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {member.lastMeetingDate === null ? "未実施" : `${member.daysSinceLast} 日前`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
