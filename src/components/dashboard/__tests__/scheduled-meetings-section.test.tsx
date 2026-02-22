import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ScheduledMeeting } from "@/lib/actions/analytics-actions";

import { ScheduledMeetingsSection } from "../scheduled-meetings-section";

afterEach(() => {
  cleanup();
});

const baseDate = new Date("2026-02-22T00:00:00Z");
const todayMeeting: ScheduledMeeting = {
  id: "m1",
  name: "山田 太郎",
  department: "開発部",
  position: null,
  meetingIntervalDays: 14,
  nextRecommendedDate: baseDate,
  lastMeetingDate: new Date("2026-02-08T00:00:00Z"),
};

const futureMeeting: ScheduledMeeting = {
  id: "m2",
  name: "佐藤 花子",
  department: null,
  position: null,
  meetingIntervalDays: 7,
  nextRecommendedDate: new Date("2026-02-25T00:00:00Z"),
  lastMeetingDate: new Date("2026-02-18T00:00:00Z"),
};

describe("ScheduledMeetingsSection", () => {
  it("shows empty state when no meetings scheduled", () => {
    render(<ScheduledMeetingsSection meetings={[]} />);
    expect(screen.getByText("今週予定の1on1はありません")).toBeDefined();
  });

  it("renders member names", () => {
    render(<ScheduledMeetingsSection meetings={[todayMeeting]} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
  });

  it("shows interval badge", () => {
    render(<ScheduledMeetingsSection meetings={[todayMeeting]} />);
    expect(screen.getByText("隔週")).toBeDefined();
  });

  it("shows 1on1準備 button with correct link", () => {
    render(<ScheduledMeetingsSection meetings={[todayMeeting]} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/members/m1/meetings/prepare");
  });

  it("renders multiple members", () => {
    render(<ScheduledMeetingsSection meetings={[todayMeeting, futureMeeting]} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
    expect(screen.getByText("佐藤 花子")).toBeDefined();
  });

  it("shows 毎週 badge for weekly interval", () => {
    render(<ScheduledMeetingsSection meetings={[futureMeeting]} />);
    expect(screen.getByText("毎週")).toBeDefined();
  });
});
