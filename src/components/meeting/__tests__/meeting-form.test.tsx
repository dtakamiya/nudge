import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { MeetingForm } from "../meeting-form";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  createMeeting: vi.fn(),
  updateMeeting: vi.fn(),
}));

// Mock dnd-kit to avoid jsdom DnD issues

// Mock IcebreakerCard to avoid random messages in tests
vi.mock("../icebreaker-card", () => ({
  IcebreakerCard: () => <div data-testid="icebreaker-card">Icebreaker</div>,
}));

// Mock checkin-messages to return deterministic value
vi.mock("@/lib/checkin-messages", () => ({
  getRandomCheckinMessage: () => "今日の調子はどうですか？",
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

  it("renders drag handles for each topic", () => {
    const initialTopics = [
      { category: "WORK_PROGRESS", title: "Topic 1", notes: "", sortOrder: 0 },
      { category: "CAREER", title: "Topic 2", notes: "", sortOrder: 1 },
    ];
    render(<MeetingForm memberId="m1" initialTopics={initialTopics} />);
    expect(screen.getByTestId("drag-handle-topic-0")).toBeTruthy();
    expect(screen.getByTestId("drag-handle-topic-1")).toBeTruthy();
  });

  it("adds a new topic with + 話題を追加 button", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs).toHaveLength(2);
  });

  it("renders CheckinSection in the form", () => {
    render(<MeetingForm memberId="m1" />);
    expect(screen.getByText("チェックイン")).toBeTruthy();
    expect(screen.getByTestId("icebreaker-card")).toBeTruthy();
  });

  it("renders condition selector buttons in CheckinSection", () => {
    render(<MeetingForm memberId="m1" />);
    // Condition selector has buttons with aria-label for each axis
    const healthButtons = screen.getAllByRole("button", { name: /体調:/ });
    expect(healthButtons.length).toBeGreaterThan(0);
  });

  it("renders two save buttons (header and footer) in create mode", () => {
    render(<MeetingForm memberId="m1" />);
    const saveButtons = screen.getAllByRole("button", { name: "1on1を保存" });
    expect(saveButtons).toHaveLength(2);
  });

  it("shows ClosingDialog when header save button is clicked", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    // Click header save button (first one)
    const saveButtons = screen.getAllByRole("button", { name: "1on1を保存" });
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });
  });

  it("shows ClosingDialog when form is submitted", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getAllByRole("button", { name: "1on1を保存" })[0]);

    // ClosingDialog should appear
    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });
  });

  it("calls createMeeting when ClosingDialog confirm button is clicked", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: true, data: {} as never });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getAllByRole("button", { name: "1on1を保存" })[0]);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    // Click save button in dialog (アクション未設定時は「このまま保存」)
    const saveButton = screen.getByRole("button", { name: /アクションなしで保存|保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  it("shows success toast on create after ClosingDialog confirm", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: true, data: {} as never });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getAllByRole("button", { name: "1on1を保存" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /アクションなしで保存|保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.createSuccess);
    });
    expect(mockPush).toHaveBeenCalledWith("/members/m1");
  });

  it("shows error toast on create failure after ClosingDialog confirm", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: false, error: "保存エラー" });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getAllByRole("button", { name: "1on1を保存" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /アクションなしで保存|保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.createError);
    });
  });

  it("renders drag handles for action items after adding", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);
    await user.click(screen.getByRole("button", { name: /アクション追加/ }));
    expect(screen.getByTestId("drag-handle-action-0")).toBeTruthy();
  });
});

describe("MeetingForm (edit mode)", () => {
  afterEach(() => cleanup());

  const mockInitialData = {
    meetingId: "meeting-1",
    date: "2026-02-20T10:00:00.000Z",
    conditionHealth: 4,
    conditionMood: 3,
    conditionWorkload: 2,
    checkinNote: "体調良好",
    topics: [
      {
        id: "topic-1",
        category: "WORK_PROGRESS",
        title: "Existing topic",
        notes: "Some notes",
        sortOrder: 0,
      },
      { id: "topic-2", category: "CAREER", title: "Career talk", notes: "", sortOrder: 1 },
    ],
    actionItems: [
      {
        id: "action-1",
        title: "Existing action",
        description: "Desc",
        sortOrder: 0,
        dueDate: "2026-03-01",
        status: "TODO",
      },
    ],
  };

  it("pre-fills form with initialData", () => {
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    const titleInputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(titleInputs).toHaveLength(2);
    expect(titleInputs[0]).toHaveProperty("value", "Existing topic");
    expect(titleInputs[1]).toHaveProperty("value", "Career talk");

    const actionInputs = screen.getAllByPlaceholderText("アクションのタイトル");
    expect(actionInputs).toHaveLength(1);
    expect(actionInputs[0]).toHaveProperty("value", "Existing action");
  });

  it("shows update button text in edit mode", () => {
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    const updateButtons = screen.getAllByRole("button", { name: "1on1を更新" });
    expect(updateButtons).toHaveLength(2);
  });

  it("shows save button text in create mode", () => {
    render(<MeetingForm memberId="m1" />);
    const saveButtons = screen.getAllByRole("button", { name: "1on1を保存" });
    expect(saveButtons).toHaveLength(2);
  });

  it("pre-fills checkinNote from initialData", () => {
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    const textarea = screen.getByPlaceholderText("気になることや共有したいことを入力...");
    expect(textarea).toHaveProperty("value", "体調良好");
  });

  it("renders two update buttons in edit mode (header and footer)", () => {
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    const updateButtons = screen.getAllByRole("button", { name: "1on1を更新" });
    expect(updateButtons).toHaveLength(2);
  });

  it("shows ClosingDialog when update form is submitted", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    await user.click(screen.getAllByRole("button", { name: "1on1を更新" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });
  });

  it("calls updateMeeting after ClosingDialog confirm in edit mode", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: true, data: {} as never });

    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} onSuccess={onSuccess} />);

    await user.click(screen.getAllByRole("button", { name: "1on1を更新" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        meetingId: "meeting-1",
        conditionHealth: 4,
        conditionMood: 3,
        conditionWorkload: 2,
        checkinNote: "体調良好",
      }),
    );
  });

  it("calls onSuccess and shows toast after successful update via ClosingDialog", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: true, data: {} as never });

    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} onSuccess={onSuccess} />);

    await user.click(screen.getAllByRole("button", { name: "1on1を更新" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.updateSuccess);
  });

  it("shows error toast when update fails via ClosingDialog", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: false, error: "更新エラー" });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);

    await user.click(screen.getAllByRole("button", { name: "1on1を更新" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.updateError);
    });
  });

  it("adds new topic in edit mode", async () => {
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const titleInputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(titleInputs).toHaveLength(3);
  });

  it("tracks deleted topic ids when removing existing topics", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: true, data: {} as never });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} onSuccess={vi.fn()} />);

    // Remove the second topic (Career talk)
    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    // Find the delete button for topics (not actions)
    await user.click(deleteButtons[1]); // second topic delete button

    await user.click(screen.getAllByRole("button", { name: "1on1を更新" })[0]);

    await waitFor(() => {
      expect(screen.getByText("ミーティングを保存しますか？")).toBeTruthy();
    });

    const saveButton = screen.getByRole("button", { name: /保存する/ });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedTopicIds: ["topic-2"],
        }),
      );
    });
  });
});
