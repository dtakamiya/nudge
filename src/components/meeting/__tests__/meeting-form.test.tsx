import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MeetingForm } from "../meeting-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  createMeeting: vi.fn(),
}));

describe("MeetingForm", () => {
  afterEach(() => cleanup());

  it("renders with default empty topic when no initialTopics", () => {
    render(<MeetingForm memberId="m1" />);
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toHaveProperty("value", "");
  });

  it("pre-fills topics from initialTopics prop", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "今週の進捗報告", notes: "メモ", sortOrder: 0 },
      { category: "ISSUES", title: "困っていること", notes: "", sortOrder: 1 },
    ];
    render(<MeetingForm memberId="m1" initialTopics={initialTopics} />);
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveProperty("value", "今週の進捗報告");
    expect(inputs[1]).toHaveProperty("value", "困っていること");
  });
});
