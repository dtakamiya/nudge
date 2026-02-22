import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemberStatsBar } from "../member-stats-bar";

afterEach(() => {
  cleanup();
});

describe("MemberStatsBar", () => {
  it("最終1on1が未実施の場合を表示する", () => {
    render(
      <MemberStatsBar
        lastMeetingDate={null}
        totalMeetingCount={0}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("最終1on1")).toBeDefined();
    expect(screen.getAllByText("未実施").length).toBeGreaterThan(0);
  });

  it("通算1on1回数を表示する", () => {
    render(
      <MemberStatsBar
        lastMeetingDate={null}
        totalMeetingCount={12}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("通算1on1")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("回")).toBeDefined();
  });

  it("未完了アクション数を表示する", () => {
    render(
      <MemberStatsBar
        lastMeetingDate={null}
        totalMeetingCount={0}
        pendingActionCount={5}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("未完了アクション")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("件")).toBeDefined();
  });

  it("今日の日付は '今日' を表示する", () => {
    const today = new Date();
    render(
      <MemberStatsBar
        lastMeetingDate={today}
        totalMeetingCount={1}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("今日")).toBeDefined();
  });

  it("7日前の日付は '7日経過' を表示する", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    render(
      <MemberStatsBar
        lastMeetingDate={date}
        totalMeetingCount={5}
        pendingActionCount={2}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("7日経過")).toBeDefined();
  });

  it("14日前の日付は '2週間経過' を表示する", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    render(
      <MemberStatsBar
        lastMeetingDate={date}
        totalMeetingCount={10}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("2週間経過")).toBeDefined();
  });

  it("次回推奨日カードを表示する", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    render(
      <MemberStatsBar
        lastMeetingDate={date}
        totalMeetingCount={5}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("次回推奨日")).toBeDefined();
    // 7日前のミーティング、interval=14 → next=7日後 → 「あと7日」
    expect(screen.getByText("あと7日")).toBeDefined();
  });

  it("lastMeetingDate が null の場合、次回推奨日は未設定を表示する", () => {
    render(
      <MemberStatsBar
        lastMeetingDate={null}
        totalMeetingCount={0}
        pendingActionCount={0}
        meetingIntervalDays={14}
      />,
    );
    expect(screen.getByText("未設定")).toBeDefined();
  });
});
