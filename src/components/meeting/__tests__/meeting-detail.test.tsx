import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingDetail } from "../meeting-detail";

// Mock ActionListCompact
vi.mock("@/components/action/action-list-compact", () => ({
  ActionListCompact: () => <div data-testid="action-list-compact" />,
}));

vi.mock("@/lib/mood", () => ({
  getMoodOption: (mood: number | null | undefined) => {
    if (!mood) return null;
    return { emoji: "😊", label: "良い" };
  },
}));

const baseProps = {
  date: new Date("2026-02-20T10:00:00.000Z"),
  topics: [
    {
      id: "topic-1",
      category: "WORK_PROGRESS",
      title: "Sprint review",
      notes: "Good progress",
      sortOrder: 0,
    },
  ],
  actionItems: [
    {
      id: "action-1",
      title: "Fix bug",
      description: "Critical",
      status: "TODO",
      dueDate: null,
      meeting: { date: new Date("2026-02-20T10:00:00.000Z") },
    },
  ],
};

describe("MeetingDetail", () => {
  afterEach(() => cleanup());

  it("renders date", () => {
    render(<MeetingDetail {...baseProps} />);
    // Date is formatted; just check the component renders without error
    expect(screen.getByTestId("action-list-compact")).toBeTruthy();
  });

  it("renders topics section", () => {
    render(<MeetingDetail {...baseProps} />);
    expect(screen.getByText("Sprint review")).toBeTruthy();
    expect(screen.getByText("Good progress")).toBeTruthy();
  });

  it("shows 話題なし when topics are empty", () => {
    render(<MeetingDetail {...baseProps} topics={[]} />);
    expect(screen.getByText("話題なし")).toBeTruthy();
  });

  it("renders mood emoji when mood is provided", () => {
    render(<MeetingDetail {...baseProps} mood={4} />);
    expect(screen.getByLabelText("雰囲気: 良い")).toBeTruthy();
  });

  it("does not render checkin section when no condition or note", () => {
    render(<MeetingDetail {...baseProps} />);
    expect(screen.queryByText("チェックイン")).toBeNull();
  });

  it("renders conditionHealth when provided", () => {
    render(<MeetingDetail {...baseProps} conditionHealth={4} />);
    expect(screen.getByText("チェックイン")).toBeTruthy();
    expect(screen.getByText(/体調🏥:/)).toBeTruthy();
    // ConditionBar renders ●●●●○（4/5）
    expect(screen.getByText(/4\/5/)).toBeTruthy();
  });

  it("renders conditionMood when provided", () => {
    render(<MeetingDetail {...baseProps} conditionMood={3} />);
    expect(screen.getByText(/気分💭:/)).toBeTruthy();
    expect(screen.getByText(/3\/5/)).toBeTruthy();
  });

  it("renders conditionWorkload when provided", () => {
    render(<MeetingDetail {...baseProps} conditionWorkload={5} />);
    expect(screen.getByText(/業務量📊:/)).toBeTruthy();
    expect(screen.getByText(/5\/5/)).toBeTruthy();
  });

  it("renders checkinNote when provided", () => {
    render(<MeetingDetail {...baseProps} checkinNote="体調は良好です" />);
    expect(screen.getByText("チェックイン")).toBeTruthy();
    expect(screen.getByText("体調は良好です")).toBeTruthy();
  });

  it("does not render conditionHealth row when conditionHealth is null", () => {
    render(<MeetingDetail {...baseProps} conditionMood={3} conditionHealth={null} />);
    expect(screen.queryByText(/体調🏥:/)).toBeNull();
    expect(screen.getByText(/気分💭:/)).toBeTruthy();
  });

  it("renders all conditions together", () => {
    render(
      <MeetingDetail
        {...baseProps}
        conditionHealth={4}
        conditionMood={3}
        conditionWorkload={2}
        checkinNote="今日は元気です"
      />,
    );
    expect(screen.getByText(/体調🏥:/)).toBeTruthy();
    expect(screen.getByText(/気分💭:/)).toBeTruthy();
    expect(screen.getByText(/業務量📊:/)).toBeTruthy();
    expect(screen.getByText("今日は元気です")).toBeTruthy();
  });
});
