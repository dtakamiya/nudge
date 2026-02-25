import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRecordingSession } from "../use-recording-session";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  endMeeting: vi.fn(),
  updateTopicNotes: vi.fn(),
}));

vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: unknown) => value,
}));

const mockEndMeeting = vi.mocked((await import("@/lib/actions/meeting-actions")).endMeeting);
const mockUpdateTopicNotes = vi.mocked(
  (await import("@/lib/actions/meeting-actions")).updateTopicNotes,
);

const sampleTopics = [
  { id: "t1", category: "WORK_PROGRESS", title: "今週の進捗", notes: "既存メモ", sortOrder: 1 },
  { id: "t2", category: "ISSUES", title: "困っていること", notes: null, sortOrder: 0 },
];

describe("useRecordingSession", () => {
  it("初期状態で localNotes がトピックのデータで初期化される", () => {
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    expect(result.current.localNotes.get("t1")).toBe("既存メモ");
    expect(result.current.localNotes.get("t2")).toBe("");
  });

  it("初期状態で sortedTopics が sortOrder でソートされる", () => {
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    expect(result.current.sortedTopics[0].id).toBe("t2");
    expect(result.current.sortedTopics[1].id).toBe("t1");
  });

  it("初期状態で isEnding が false", () => {
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    expect(result.current.isEnding).toBe(false);
  });

  it("初期状態で saveStatus が 'idle'", () => {
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    expect(result.current.saveStatus).toBe("idle");
  });

  it("handleNotesChange でノートが更新される", () => {
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    act(() => {
      result.current.handleNotesChange("t1", "新しいメモ");
    });
    expect(result.current.localNotes.get("t1")).toBe("新しいメモ");
  });

  it("handleRetry で saveStatus が 'idle' になる", async () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: false, error: "エラー" });
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    await act(async () => {
      await result.current.handleBlur("t1");
    });
    act(() => {
      result.current.handleRetry();
    });
    expect(result.current.saveStatus).toBe("idle");
  });

  it("handleSaveIdle で saveStatus が 'idle' になる", async () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    await act(async () => {
      await result.current.handleBlur("t1");
    });
    act(() => {
      result.current.handleSaveIdle();
    });
    expect(result.current.saveStatus).toBe("idle");
  });

  it("handleEnd 成功時に endMeeting が呼ばれ、onEnd が呼ばれる", async () => {
    mockEndMeeting.mockResolvedValue({ success: true, data: {} as never });
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "meeting-abc", topics: sampleTopics, onEnd }),
    );
    await act(async () => {
      await result.current.handleEnd();
    });
    expect(mockEndMeeting).toHaveBeenCalledWith({ meetingId: "meeting-abc" });
    expect(onEnd).toHaveBeenCalled();
  });

  it("handleEnd 失敗時に onEnd が呼ばれない", async () => {
    mockEndMeeting.mockResolvedValue({ success: false, error: "失敗" });
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd }),
    );
    await act(async () => {
      await result.current.handleEnd();
    });
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("handleBlur で updateTopicNotes が呼ばれる", async () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    await act(async () => {
      await result.current.handleBlur("t1");
    });
    expect(mockUpdateTopicNotes).toHaveBeenCalledWith({ topicId: "t1", notes: "既存メモ" });
  });

  it("handleBlur 成功時に saveStatus が 'saved' になる", async () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: true, data: {} as never });
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    await act(async () => {
      await result.current.handleBlur("t1");
    });
    expect(result.current.saveStatus).toBe("saved");
  });

  it("handleBlur 失敗時に saveStatus が 'error' になる", async () => {
    mockUpdateTopicNotes.mockResolvedValue({ success: false, error: "保存エラー" });
    const { result } = renderHook(() =>
      useRecordingSession({ meetingId: "m1", topics: sampleTopics, onEnd: vi.fn() }),
    );
    await act(async () => {
      await result.current.handleBlur("t1");
    });
    expect(result.current.saveStatus).toBe("error");
  });
});
