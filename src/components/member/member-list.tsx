"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AvatarInitial } from "@/components/ui/avatar-initial";
import { formatRelativeDate } from "@/lib/format";
import { ArrowUpDown } from "lucide-react";

type MemberWithStats = {
  readonly id: string;
  readonly name: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly _count: { readonly actionItems: number };
  readonly meetings: readonly { readonly date: Date }[];
  readonly overdueActionCount: number;
};

type SortKey = "lastMeeting" | "actions";
type SortDir = "asc" | "desc";

function getLastMeetingDays(date: Date | null): number {
  if (!date) return Infinity;
  return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusBadge(days: number): React.ReactNode {
  if (days >= 14)
    return (
      <Badge className="animate-pulse-attention bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.15_25)]">
        要フォロー
      </Badge>
    );
  if (days >= 7)
    return <Badge className="bg-[oklch(0.95_0.05_80)] text-[oklch(0.4_0.1_80)]">注意</Badge>;
  return <Badge className="bg-[oklch(0.95_0.05_155)] text-[oklch(0.35_0.1_155)]">良好</Badge>;
}

type Props = {
  readonly members: readonly MemberWithStats[];
};

export function MemberList({ members }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("lastMeeting");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>メンバーがまだ登録されていません</p>
        <Link href="/members/new">
          <Button className="mt-4">メンバーを追加</Button>
        </Link>
      </div>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "lastMeeting") {
      const daysA = getLastMeetingDays(a.meetings[0]?.date ?? null);
      const daysB = getLastMeetingDays(b.meetings[0]?.date ?? null);
      return (daysB - daysA) * dir;
    }
    return (b._count.actionItems - a._count.actionItems) * dir;
  });

  return (
    <div className="animate-fade-in-up rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
              メンバー
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
              部署
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
              <button
                onClick={() => toggleSort("lastMeeting")}
                className="flex items-center gap-1 hover:text-foreground transition-colors duration-150"
              >
                最終1on1
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
              <button
                onClick={() => toggleSort("actions")}
                className="flex items-center gap-1 hover:text-foreground transition-colors duration-150"
              >
                未完了
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
              ステータス
            </TableHead>
            <TableHead className="px-4 py-3">
              <span className="sr-only">アクション</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMembers.map((member) => {
            const lastDate = member.meetings[0]?.date ?? null;
            const days = getLastMeetingDays(lastDate);
            return (
              <TableRow
                key={member.id}
                onClick={() => router.push(`/members/${member.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/members/${member.id}`);
                }}
                tabIndex={0}
                role="link"
                className="hover:bg-muted/50 hover:shadow-sm cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AvatarInitial name={member.name} size="sm" />
                    <div>
                      <span className="font-medium text-sm">{member.name}</span>
                      {member.position && (
                        <p className="text-xs text-muted-foreground">{member.position}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                  {member.department ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                  {formatRelativeDate(lastDate)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm">
                  <div>
                    {member._count.actionItems > 0 ? (
                      <span className="text-foreground">{member._count.actionItems}件</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {member.overdueActionCount > 0 && (
                      <p className="text-destructive text-xs">{member.overdueActionCount}件超過</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 hidden md:table-cell">
                  {getStatusBadge(days)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Link
                    href={`/members/${member.id}/meetings/new`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="xs" variant="outline">
                      1on1
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
