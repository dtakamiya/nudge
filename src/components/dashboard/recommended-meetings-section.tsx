import Link from "next/link";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Button } from "@/components/ui/button";
import type { RecommendedMeeting } from "@/lib/actions/analytics-actions";

export function RecommendedMeetingsSection({ members }: { members: RecommendedMeeting[] }) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">全員と最近1on1を実施済みです</p>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <AvatarInitial name={member.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground">
              {member.daysSinceLast >= 9999 ? "未実施" : `${member.daysSinceLast}日経過`}
            </p>
          </div>
          <Link href={`/members/${member.id}/meetings/prepare`}>
            <Button size="sm" variant="outline" className="text-xs h-7">
              1on1準備
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
