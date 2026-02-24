import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { MemberTimelineEntry } from "@/lib/types";

import { MemberTimeline } from "../member-timeline";

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

const meetingEntry: MemberTimelineEntry = {
  type: "meeting",
  id: "meeting-extra",
  date: new Date("2026-01-10T00:00:00Z"),
  mood: 4,
  topicCount: 2,
  actionCount: 3,
};

const completedEntry: MemberTimelineEntry = {
  type: "action_completed",
  id: "action-1",
  title: "完了したアクション",
  completedAt: new Date("2026-01-12T00:00:00Z"),
  meetingId: "meeting-extra",
};

const overdueEntry: MemberTimelineEntry = {
  type: "action_overdue",
  id: "action-2",
  title: "期限切れアクション",
  dueDate: new Date("2026-01-05T00:00:00Z"),
  meetingId: "meeting-extra",
};

function generateEntries(count: number): MemberTimelineEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    type: "meeting" as const,
    id: `meeting-${i}`,
    date: new Date(`2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    mood: null,
    topicCount: 0,
    actionCount: 0,
  }));
}

describe("MemberTimeline", () => {
  it("エントリが5件未満のとき空状態メッセージを表示する", () => {
    render(<MemberTimeline entries={generateEntries(4)} memberId={memberId} />);
    expect(screen.getByText("まだ活動の記録がありません")).toBeDefined();
  });

  it("エントリが0件のとき空状態メッセージを表示する", () => {
    render(<MemberTimeline entries={[]} memberId={memberId} />);
    expect(screen.getByText("まだ活動の記録がありません")).toBeDefined();
  });

  it("エントリが5件以上のときタイムラインを表示する", () => {
    render(<MemberTimeline entries={generateEntries(5)} memberId={memberId} />);
    expect(screen.queryByText("まだ活動の記録がありません")).toBeNull();
  });

  it("ミーティングエントリを正しく表示する", () => {
    render(
      <MemberTimeline entries={generateEntries(4).concat(meetingEntry)} memberId={memberId} />,
    );
    // topicCount と actionCount の表示
    expect(screen.getByText(/話題.*2/)).toBeDefined();
    expect(screen.getByText(/アクション.*3/)).toBeDefined();
  });

  it("アクション完了エントリのタイトルを表示する", () => {
    render(
      <MemberTimeline entries={generateEntries(4).concat(completedEntry)} memberId={memberId} />,
    );
    expect(screen.getByText("完了したアクション")).toBeDefined();
  });

  it("期限超過エントリのタイトルを表示する", () => {
    render(
      <MemberTimeline entries={generateEntries(4).concat(overdueEntry)} memberId={memberId} />,
    );
    expect(screen.getByText("期限切れアクション")).toBeDefined();
  });

  it("タイムラインエントリにリンクが設定されている", () => {
    render(
      <MemberTimeline entries={generateEntries(4).concat(meetingEntry)} memberId={memberId} />,
    );
    const links = screen.getAllByRole("link");
    const meetingLink = links.find((l) =>
      l.getAttribute("href")?.includes(`/members/${memberId}/meetings/meeting-extra`),
    );
    expect(meetingLink).toBeDefined();
  });
});
