import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MeetingIntervalTable } from "../meeting-interval-table";

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
  },
  {
    id: "m2",
    name: "鈴木 花子",
    department: null,
    position: null,
    daysSinceLast: 9999,
    lastMeetingDate: null,
  },
];

describe("MeetingIntervalTable", () => {
  it("renders member names", () => {
    render(<MeetingIntervalTable data={mockData} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
    expect(screen.getByText("鈴木 花子")).toBeDefined();
  });

  it("shows 未実施 for members with no meetings", () => {
    render(<MeetingIntervalTable data={mockData} />);
    const elements = screen.getAllByText("未実施");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("shows days since last meeting", () => {
    render(<MeetingIntervalTable data={mockData} />);
    const elements = screen.getAllByText("30 日前");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders empty state when no data", () => {
    render(<MeetingIntervalTable data={[]} />);
    expect(screen.getByText("データがありません")).toBeDefined();
  });
});
