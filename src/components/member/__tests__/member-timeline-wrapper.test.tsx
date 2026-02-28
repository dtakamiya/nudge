import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MemberTimelineEntry } from "@/lib/types";

import { MemberTimelineWrapper } from "../member-timeline-wrapper";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const memberId = "member-1";

function generateEntries(): MemberTimelineEntry[] {
  const now = new Date();
  // 最近のエントリ（30日以内）
  const recentEntries: MemberTimelineEntry[] = Array.from({ length: 3 }, (_, i) => ({
    type: "meeting" as const,
    id: `recent-meeting-${i}`,
    date: new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000),
    mood: null,
    topicCount: 1,
    actionCount: 1,
  }));

  // 古いエントリ（120日前）
  const oldEntries: MemberTimelineEntry[] = [
    {
      type: "meeting" as const,
      id: "old-meeting-1",
      date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      mood: null,
      topicCount: 2,
      actionCount: 0,
    },
    {
      type: "goal_completed" as const,
      id: "old-goal-1",
      title: "古いゴール達成",
      completedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      memberId,
    },
  ];

  return [...recentEntries, ...oldEntries];
}

describe("MemberTimelineWrapper", () => {
  it("デフォルトで全エントリを表示する", () => {
    const entries = generateEntries();
    render(<MemberTimelineWrapper entries={entries} memberId={memberId} />);
    // 5件（threshold以上）なのでタイムラインが表示される
    expect(screen.queryByText("まだ活動の記録がありません")).toBeNull();
  });

  it("期間フィルタが表示される", () => {
    const entries = generateEntries();
    render(<MemberTimelineWrapper entries={entries} memberId={memberId} />);
    expect(screen.getByLabelText("期間フィルタ")).toBeDefined();
  });

  it("デフォルトで「全期間」が選択されている", () => {
    const entries = generateEntries();
    render(<MemberTimelineWrapper entries={entries} memberId={memberId} />);
    expect(screen.getByText("全期間")).toBeDefined();
  });
});
