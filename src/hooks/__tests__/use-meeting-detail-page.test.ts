import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMeetingDetailPage } from "../use-meeting-detail-page";

const { mockRefresh, mockSetFocusMode } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockSetFocusMode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  startMeeting: vi.fn(),
}));

vi.mock("@/hooks/use-focus-mode", () => ({
  useFocusMode: () => ({
    setFocusMode: mockSetFocusMode,
    isFocusMode: false,
    toggleFocusMode: vi.fn(),
  }),
}));

vi.mock("@/lib/meeting-summary", () => ({
  generateMeetingSummaryText: vi.fn(() => "サマリーテキスト"),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockStartMeeting = vi.mocked((await import("@/lib/actions/meeting-actions")).startMeeting);
const mockGenerateMeetingSummaryText = vi.mocked(
  (await import("@/lib/meeting-summary")).generateMeetingSummaryText,
);

const baseOptions = {
  meetingId: "meeting-1",
  memberName: "田中太郎",
  date: new Date("2024-01-15"),
  topics: [
    {
      id: "t1",
      category: "WORK_PROGRESS",
      title: "進捗確認",
      notes: "順調",
      sortOrder: 0,
    },
  ],
  actionItems: [
    {
      id: "a1",
      title: "資料作成",
      description: "",
      sortOrder: 0,
      status: "TODO",
      dueDate: null,
      meeting: { date: new Date("2024-01-15") },
    },
  ],
};

describe("useMeetingDetailPage", () => {
  it("初期状態で isEditing が false", () => {
    const { result } = renderHook(() => useMeetingDetailPage(baseOptions));
    expect(result.current.isEditing).toBe(false);
  });

  it("初期状態で isRecording が false（startedAt=null, endedAt=null の場合）", () => {
    const { result } = renderHook(() =>
      useMeetingDetailPage({ ...baseOptions, startedAt: null, endedAt: null }),
    );
    expect(result.current.isRecording).toBe(false);
  });

  it("startedAt があり endedAt がない場合、isRecording が true", () => {
    const { result } = renderHook(() =>
      useMeetingDetailPage({
        ...baseOptions,
        startedAt: new Date("2024-01-15T10:00:00"),
        endedAt: null,
      }),
    );
    expect(result.current.isRecording).toBe(true);
  });

  it("startedAt と endedAt の両方がある場合、isRecording が false", () => {
    const { result } = renderHook(() =>
      useMeetingDetailPage({
        ...baseOptions,
        startedAt: new Date("2024-01-15T10:00:00"),
        endedAt: new Date("2024-01-15T11:00:00"),
      }),
    );
    expect(result.current.isRecording).toBe(false);
  });

  it("初期状態で isStarting が false", () => {
    const { result } = renderHook(() => useMeetingDetailPage(baseOptions));
    expect(result.current.isStarting).toBe(false);
  });

  it("handleEditSuccess() で isEditing が false になり router.refresh が呼ばれる", async () => {
    mockRefresh.mockClear();

    const { result } = renderHook(() => useMeetingDetailPage(baseOptions));

    act(() => {
      result.current.setIsEditing(true);
    });
    expect(result.current.isEditing).toBe(true);

    await act(async () => {
      result.current.handleEditSuccess();
    });
    expect(result.current.isEditing).toBe(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("handleRecordingEnd() で isRecording が false になり setFocusMode(false) が呼ばれ router.refresh が呼ばれる", async () => {
    mockRefresh.mockClear();
    mockSetFocusMode.mockClear();

    const { result } = renderHook(() =>
      useMeetingDetailPage({
        ...baseOptions,
        startedAt: new Date("2024-01-15T10:00:00"),
        endedAt: null,
      }),
    );
    expect(result.current.isRecording).toBe(true);

    await act(async () => {
      result.current.handleRecordingEnd();
    });
    expect(result.current.isRecording).toBe(false);
    expect(mockSetFocusMode).toHaveBeenCalledWith(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("handleStartMeeting() 成功時に isRecording が true になる", async () => {
    mockStartMeeting.mockResolvedValue({ success: true, data: {} as never });

    const { result } = renderHook(() =>
      useMeetingDetailPage({ ...baseOptions, startedAt: null, endedAt: null }),
    );
    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.handleStartMeeting();
    });
    expect(result.current.isRecording).toBe(true);
  });

  it("handleStartMeeting() 失敗時に isRecording が false のまま", async () => {
    mockStartMeeting.mockResolvedValue({ success: false, error: "エラー" });

    const { result } = renderHook(() =>
      useMeetingDetailPage({ ...baseOptions, startedAt: null, endedAt: null }),
    );

    await act(async () => {
      await result.current.handleStartMeeting();
    });
    expect(result.current.isRecording).toBe(false);
  });

  it("handleCopySummary() で generateMeetingSummaryText が呼ばれる", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const { result } = renderHook(() => useMeetingDetailPage(baseOptions));

    await act(async () => {
      await result.current.handleCopySummary();
    });
    expect(mockGenerateMeetingSummaryText).toHaveBeenCalled();
  });

  it("handleCopySummary() でクリップボードにテキストがコピーされる", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
    });
    mockGenerateMeetingSummaryText.mockReturnValue("コピーするテキスト");

    const { result } = renderHook(() => useMeetingDetailPage(baseOptions));

    await act(async () => {
      await result.current.handleCopySummary();
    });
    expect(mockWriteText).toHaveBeenCalledWith("コピーするテキスト");
  });

  it("handleStartMeeting() 中は isStarting が true になる", async () => {
    let resolvePromise!: () => void;
    mockStartMeeting.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true, data: {} as never });
        }),
    );

    const { result } = renderHook(() =>
      useMeetingDetailPage({ ...baseOptions, startedAt: null, endedAt: null }),
    );

    act(() => {
      void result.current.handleStartMeeting();
    });
    expect(result.current.isStarting).toBe(true);

    await act(async () => {
      resolvePromise();
    });
    expect(result.current.isStarting).toBe(false);
  });
});
