import Link from "next/link";
import { Heart } from "lucide-react";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { RecommendedMeeting } from "@/lib/actions/analytics-actions";

export function RecommendedMeetingsSection({ members }: { members: RecommendedMeeting[] }) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="全員と最近1on1を実施済みです"
        description="引き続き定期的な1on1でチームをサポートしましょう"
        size="compact"
      />
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
