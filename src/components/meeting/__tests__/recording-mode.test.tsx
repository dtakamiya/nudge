import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecordingMode } from "../recording-mode";

vi.mock("@/lib/actions/meeting-actions", () => ({
  endMeeting: vi.fn(),
  updateTopicNotes: vi.fn(),
}));

vi.mock("@/hooks/use-elapsed-time", () => ({
  useElapsedTime: () => ({
    minutes: 1,
    seconds: 0,
    formatted: "01:00",
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { endMeeting, updateTopicNotes } from "@/lib/actions/meeting-actions";

const mockEndMeeting = vi.mocked(endMeeting);
const mockUpdateTopicNotes = vi.mocked(updateTopicNotes);

const defaultTopics = [
  {
    id: "topic-1",
    category: "WORK_PROGRESS",
    title: "業務進捗の確認",
    notes: null,
    sortOrder: 1,
  },
  {
    id: "topic-2",
    category: "CAREER",
    title: "キャリア相談",
    notes: "既存メモ",
    sortOrder: 2,
  },
];

const defaultProps = {
  meetingId: "meeting-1",
  memberId: "member-1",
  startedAt: new Date("2024-01-01T10:00:00"),
  topics: defaultTopics,
  onEnd: vi.fn(),
};

describe("RecordingMode", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("topics が正しく表示される", () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} />);
    expect(screen.getByText("業務進捗の確認")).toBeTruthy();
    expect(screen.getByText("キャリア相談")).toBeTruthy();
  });

  it("「ミーティングを終了する」ボタンが存在する", () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} />);
    expect(screen.getByRole("button", { name: "ミーティングを終了する" })).toBeTruthy();
  });

  it("終了ボタンクリックで endMeeting が呼ばれる", async () => {
    const user = userEvent.setup();
    mockEndMeeting.mockResolvedValue({ success: true, data: {} as never });
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} />);
    const endButton = screen.getByRole("button", { name: "ミーティングを終了する" });
    await user.click(endButton);
    expect(mockEndMeeting).toHaveBeenCalledWith({ meetingId: "meeting-1" });
  });

  it("endMeeting 成功後に onEnd が呼ばれる", async () => {
    const user = userEvent.setup();
    const onEnd = vi.fn();
    mockEndMeeting.mockResolvedValue({ success: true, data: {} as never });
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} onEnd={onEnd} />);
    const endButton = screen.getByRole("button", { name: "ミーティングを終了する" });
    await user.click(endButton);
    await waitFor(() => {
      expect(onEnd).toHaveBeenCalled();
    });
  });

  it("topics が空の場合にメッセージが表示される", () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} topics={[]} />);
    expect(screen.getByText("記録するトピックがありません")).toBeTruthy();
  });

  it("endMeeting 失敗時に onEnd が呼ばれない", async () => {
    const user = userEvent.setup();
    const onEnd = vi.fn();
    mockEndMeeting.mockResolvedValue({ success: false, error: "エラー" });
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} onEnd={onEnd} />);
    const endButton = screen.getByRole("button", { name: "ミーティングを終了する" });
    await user.click(endButton);
    await waitFor(() => {
      expect(mockEndMeeting).toHaveBeenCalled();
    });
    expect(onEnd).not.toHaveBeenCalled();
  });
});
