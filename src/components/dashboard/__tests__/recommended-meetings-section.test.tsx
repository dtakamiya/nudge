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
  },
];

describe("RecommendedMeetingsSection", () => {
  it("renders member names", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText("山田 太郎")).toBeDefined();
  });

  it("shows days since last meeting", () => {
    render(<RecommendedMeetingsSection members={mockMembers} />);
    expect(screen.getByText("20日経過")).toBeDefined();
  });

  it("shows empty message when no members need meetings", () => {
    render(<RecommendedMeetingsSection members={[]} />);
    expect(screen.getByText("全員と最近1on1を実施済みです")).toBeDefined();
  });
});
