import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingDetailPageClient } from "../meeting-detail-page-client";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  updateMeeting: vi.fn(),
  startMeeting: vi.fn(),
}));

vi.mock("@/hooks/use-focus-mode", () => ({
  useFocusMode: () => ({
    isFocusMode: false,
    toggleFocusMode: vi.fn(),
    setFocusMode: vi.fn(),
  }),
}));

// Mock MeetingDetail to simplify tests
vi.mock("../meeting-detail", () => ({
  MeetingDetail: ({ date }: { date: Date }) => (
    <div data-testid="meeting-detail">{date.toISOString()}</div>
  ),
}));

// Mock MeetingForm to simplify tests
vi.mock("../meeting-form", () => ({
  MeetingForm: ({
    initialData,
    onSuccess,
  }: {
    initialData?: { meetingId: string };
    onSuccess?: () => void;
  }) => (
    <div data-testid="meeting-form">
      <span>editing: {initialData?.meetingId}</span>
      <button onClick={onSuccess}>mock-save</button>
    </div>
  ),
}));

// Mock RecordingMode
vi.mock("../recording-mode", () => ({
  RecordingMode: ({ onEnd }: { onEnd: () => void }) => (
    <div data-testid="recording-mode">
      <button onClick={onEnd}>mock-end</button>
    </div>
  ),
}));

// Mock FocusModeIndicator
vi.mock("../focus-mode-indicator", () => ({
  FocusModeIndicator: () => <div data-testid="focus-mode-indicator" />,
}));

// Mock dnd-kit

vi.mock("@/lib/meeting-summary", () => ({
  generateMeetingSummaryText: vi.fn().mockReturnValue("テストサマリーテキスト"),
}));

const defaultProps = {
  meetingId: "meeting-1",
  memberId: "member-1",
  memberName: "田中太郎",
  date: new Date("2026-02-20T10:00:00.000Z"),
  topics: [
    {
      id: "topic-1",
      category: "WORK_PROGRESS",
      title: "Sprint review",
      notes: "Good",
      sortOrder: 0,
    },
  ],
  actionItems: [
    {
      id: "action-1",
      title: "Fix bug",
      description: "Critical",
      sortOrder: 0,
      status: "TODO",
      dueDate: new Date("2026-03-01"),
      meeting: { date: new Date("2026-02-20T10:00:00.000Z") },
    },
  ],
};

describe("MeetingDetailPageClient", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders MeetingDetail in view mode by default", () => {
    render(<MeetingDetailPageClient {...defaultProps} />);
    expect(screen.getByTestId("meeting-detail")).toBeTruthy();
    expect(screen.queryByTestId("meeting-form")).toBeNull();
  });

  it("shows edit button in view mode", () => {
    render(<MeetingDetailPageClient {...defaultProps} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeTruthy();
  });

  it("shows copy summary button in view mode", () => {
    render(<MeetingDetailPageClient {...defaultProps} />);
    expect(screen.getByRole("button", { name: /サマリーをコピー/ })).toBeTruthy();
  });

  it("calls generateMeetingSummaryText with memberName when copy button is clicked", async () => {
    const { generateMeetingSummaryText } = await import("@/lib/meeting-summary");
    const mockGenerate = vi.mocked(generateMeetingSummaryText);

    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /サマリーをコピー/ }));

    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ memberName: "田中太郎" }),
      );
    });
  });

  it("switches to edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /編集/ }));
    expect(screen.getByTestId("meeting-form")).toBeTruthy();
    expect(screen.queryByTestId("meeting-detail")).toBeNull();
  });

  it("shows cancel button in edit mode", async () => {
    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /編集/ }));
    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeTruthy();
  });

  it("switches back to view mode when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /編集/ }));
    await user.click(screen.getByRole("button", { name: /キャンセル/ }));
    expect(screen.getByTestId("meeting-detail")).toBeTruthy();
    expect(screen.queryByTestId("meeting-form")).toBeNull();
  });

  it("switches back to view mode and refreshes on successful save", async () => {
    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /編集/ }));
    await user.click(screen.getByRole("button", { name: "mock-save" }));
    expect(screen.getByTestId("meeting-detail")).toBeTruthy();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("shows start meeting button when startedAt and endedAt are both absent", () => {
    render(<MeetingDetailPageClient {...defaultProps} startedAt={null} endedAt={null} />);
    expect(screen.getByRole("button", { name: /記録を開始/ })).toBeTruthy();
  });

  it("calls startMeeting when start meeting button is clicked", async () => {
    const { startMeeting } = await import("@/lib/actions/meeting-actions");
    const mockStartMeeting = vi.mocked(startMeeting);
    mockStartMeeting.mockResolvedValueOnce({ success: true, data: {} as never });

    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} startedAt={null} endedAt={null} />);
    await user.click(screen.getByRole("button", { name: /記録を開始/ }));
    expect(mockStartMeeting).toHaveBeenCalledWith({ meetingId: "meeting-1" });
  });

  it("shows RecordingMode when startedAt is set and endedAt is null", () => {
    render(
      <MeetingDetailPageClient
        {...defaultProps}
        startedAt={new Date("2026-02-20T10:00:00.000Z")}
        endedAt={null}
      />,
    );
    expect(screen.getByTestId("recording-mode")).toBeTruthy();
    expect(screen.queryByTestId("meeting-detail")).toBeNull();
  });

  it("shows view mode (not recording) when both startedAt and endedAt are set", () => {
    render(
      <MeetingDetailPageClient
        {...defaultProps}
        startedAt={new Date("2026-02-20T10:00:00.000Z")}
        endedAt={new Date("2026-02-20T11:00:00.000Z")}
      />,
    );
    expect(screen.getByTestId("meeting-detail")).toBeTruthy();
    expect(screen.queryByTestId("recording-mode")).toBeNull();
  });

  it("does not show start meeting button when meeting has ended", () => {
    render(
      <MeetingDetailPageClient
        {...defaultProps}
        startedAt={new Date("2026-02-20T10:00:00.000Z")}
        endedAt={new Date("2026-02-20T11:00:00.000Z")}
      />,
    );
    expect(screen.queryByRole("button", { name: /記録を開始/ })).toBeNull();
  });
});
