import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingIntervalTable } from "../meeting-interval-table";

afterEach(() => {
  cleanup();
});

vi.mock("@/components/ui/avatar-initial", () => ({
  AvatarInitial: ({ name }: { name: string }) => <div data-testid="avatar">{name[0]}</div>,
}));

const mockData = [
  {
    id: "m1",
    name: "山田 太郎",
    department: "開発部",
    position: null,
    daysSinceLast: 30,
    lastMeetingDate: new Date("2026-01-23T00:00:00Z"),
    meetingIntervalDays: 14,
    nextRecommendedDate: new Date("2026-02-06T00:00:00Z"),
  },
  {
    id: "m2",
    name: "鈴木 花子",
    department: null,
    position: null,
    daysSinceLast: 9999,
    lastMeetingDate: null,
    meetingIntervalDays: 14,
    nextRecommendedDate: null,
  },
];

describe("MeetingIntervalTable", () => {
  it("実施済みメンバーを表示する", () => {
    render(<MeetingIntervalTable data={mockData} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
  });

  it("未実施メンバーはデフォルトで非表示", () => {
    render(<MeetingIntervalTable data={mockData} />);
    expect(screen.queryByText("鈴木 花子")).toBeNull();
  });

  it("未実施メンバーの件数をトグルボタンで表示する", () => {
    render(<MeetingIntervalTable data={mockData} />);
    expect(screen.getByText(/未実施メンバーを表示（1件）/)).toBeDefined();
  });

  it("トグルクリックで未実施メンバーが表示される", () => {
    render(<MeetingIntervalTable data={mockData} />);
    const toggleButton = screen.getByText(/未実施メンバーを表示（1件）/);
    fireEvent.click(toggleButton);
    expect(screen.getByText("鈴木 花子")).toBeDefined();
    expect(screen.getByText("未実施")).toBeDefined();
  });

  it("トグルを2回クリックで未実施メンバーが再び非表示になる", () => {
    render(<MeetingIntervalTable data={mockData} />);
    const toggleButton = screen.getByText(/未実施メンバーを表示（1件）/);
    fireEvent.click(toggleButton);
    fireEvent.click(screen.getByText(/折りたたむ/));
    expect(screen.queryByText("鈴木 花子")).toBeNull();
  });

  it("shows days since last meeting", () => {
    render(<MeetingIntervalTable data={mockData} />);
    const elements = screen.getAllByText("30 日前");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders empty state when no data", () => {
    render(<MeetingIntervalTable data={[]} />);
    expect(screen.getByText("メンバーが登録されていません")).toBeDefined();
  });

  it("renders guidance and action in empty state", () => {
    render(<MeetingIntervalTable data={[]} />);
    expect(
      screen.getByText("メンバーを追加すると、最終1on1の経過日数が表示されます"),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "メンバーを追加する" })).toBeDefined();
  });

  it("全員が実施済みの場合トグルボタンは表示しない", () => {
    const dataWithNoNoMeeting = [mockData[0]];
    render(<MeetingIntervalTable data={dataWithNoNoMeeting} />);
    expect(screen.queryByText(/未実施メンバーを表示/)).toBeNull();
  });
});
