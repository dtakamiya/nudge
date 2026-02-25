import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
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

vi.mock("@/hooks/use-focus-mode", () => ({
  useFocusMode: () => ({
    isFocusMode: false,
    toggleFocusMode: vi.fn(),
    setFocusMode: vi.fn(),
  }),
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

  it("blur 時に updateTopicNotes が成功すると「保存済み」が表示される", async () => {
    const user = userEvent.setup();
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} />);
    const textareas = screen.getAllByRole("textbox");
    await user.click(textareas[0]);
    await user.type(textareas[0], "テスト入力");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText("保存済み")).toBeTruthy();
    });
  });

  it("blur 時に updateTopicNotes が失敗すると「保存に失敗しました」が表示される", async () => {
    const user = userEvent.setup();
    mockUpdateTopicNotes.mockResolvedValue({ success: false, error: "エラー" });
    render(<RecordingMode {...defaultProps} />);
    const textareas = screen.getAllByRole("textbox");
    await user.click(textareas[0]);
    await user.type(textareas[0], "テスト入力");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText("保存に失敗しました")).toBeTruthy();
    });
  });

  it("保存エラー時に「再試行」ボタンが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateTopicNotes.mockResolvedValue({ success: false, error: "エラー" });
    render(<RecordingMode {...defaultProps} />);
    const textareas = screen.getAllByRole("textbox");
    await user.click(textareas[0]);
    await user.type(textareas[0], "テスト入力");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "再試行" })).toBeTruthy();
    });
  });

  it("初期状態では保存状態インジケーターが表示されない", () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    render(<RecordingMode {...defaultProps} />);
    expect(screen.queryByText("保存中...")).toBeNull();
    expect(screen.queryByText("保存済み")).toBeNull();
    expect(screen.queryByText("保存に失敗しました")).toBeNull();
  });

  it("blur 時に updateTopicNotes 呼び出し中は「保存中...」が表示される", async () => {
    let resolveUpdate!: (value: { success: true; data: never }) => void;
    mockUpdateTopicNotes.mockImplementation(
      () =>
        new Promise<{ success: true; data: never }>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<RecordingMode {...defaultProps} />);
    const textareas = screen.getAllByRole("textbox");
    await user.click(textareas[0]);
    await user.type(textareas[0], "テスト入力");
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText("保存中...")).toBeTruthy();
    });
    await act(async () => {
      resolveUpdate({ success: true, data: {} as never });
    });
  });
});
