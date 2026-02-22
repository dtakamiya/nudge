import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RecentActivityFeed } from "../recent-activity-feed";
import type { ActivityItem } from "@/lib/actions/dashboard-actions";

afterEach(() => {
  cleanup();
});

const meetingActivity: ActivityItem = {
  type: "meeting",
  id: "meeting-1",
  memberId: "member-1",
  memberName: "田中太郎",
  date: new Date("2026-02-20"),
};

const actionActivity: ActivityItem = {
  type: "action",
  id: "action-1",
  memberId: "member-2",
  memberName: "鈴木花子",
  title: "週次レポート作成",
  completedAt: new Date("2026-02-21"),
};

describe("RecentActivityFeed", () => {
  it("空の場合にメッセージを表示する", () => {
    render(<RecentActivityFeed activities={[]} />);
    expect(screen.getByText("最近のアクティビティはありません")).toBeDefined();
  });

  it("ミーティングアクティビティを表示する", () => {
    render(<RecentActivityFeed activities={[meetingActivity]} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("と 1on1 を実施")).toBeDefined();
  });

  it("アクション完了アクティビティを表示する", () => {
    render(<RecentActivityFeed activities={[actionActivity]} />);
    expect(screen.getByText("鈴木花子")).toBeDefined();
    expect(screen.getByText(/週次レポート作成/)).toBeDefined();
    expect(screen.getByText("を完了")).toBeDefined();
  });

  it("複数のアクティビティを表示する", () => {
    render(<RecentActivityFeed activities={[meetingActivity, actionActivity]} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("鈴木花子")).toBeDefined();
  });

  it("メンバー詳細ページへのリンクが正しい", () => {
    render(<RecentActivityFeed activities={[meetingActivity]} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/members/member-1");
  });
});
