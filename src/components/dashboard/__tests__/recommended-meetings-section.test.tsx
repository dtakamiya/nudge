import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { RecommendedMeetingsSection } from "../recommended-meetings-section";

afterEach(() => {
  cleanup();
});

const mockMembers = [
  {
    id: "m1",
    name: "山田 太郎",
    department: "開発部",
    position: null,
    daysSinceLast: 20,
    lastMeetingDate: new Date("2026-02-02T00:00:00Z"),
    meetingIntervalDays: 14,
    nextRecommendedDate: new Date("2026-02-16T00:00:00Z"),
  },
];

describe("RecommendedMeetingsSection", () => {
  it("renders member names", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
  });

  it("shows days since last meeting", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText(/20日経過/)).toBeDefined();
  });

  it("shows interval badge", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText("隔週")).toBeDefined();
  });

  it("shows next recommended date info", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText(/次回:/)).toBeDefined();
  });

  it("shows empty message when no members need meetings", () => {
    render(<RecommendedMeetingsSection members={[]} />);
    expect(screen.getByText("全員と最近1on1を実施済みです")).toBeDefined();
  });

  it("shows 未実施 when member has never had a meeting", () => {
    const noMeetingMember = [
      {
        id: "m2",
        name: "佐藤 花子",
        department: null,
        position: null,
        daysSinceLast: 9999,
        lastMeetingDate: null,
        meetingIntervalDays: 14,
        nextRecommendedDate: null,
      },
    ];
    render(<RecommendedMeetingsSection members={noMeetingMember} />);
    expect(screen.getByText("未実施")).toBeDefined();
  });
});
