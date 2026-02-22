import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { MeetingForm } from "../meeting-form";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  createMeeting: vi.fn(),
  updateMeeting: vi.fn(),
}));

// Mock dnd-kit to avoid jsdom DnD issues
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  arrayMove: vi.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
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

  it("shows success toast on create", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: true, data: {} as never });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getByRole("button", { name: "1on1を保存" }));

    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.createSuccess);
    expect(mockPush).toHaveBeenCalledWith("/members/m1");
  });

  it("shows error toast on create failure", async () => {
    const { createMeeting } = await import("@/lib/actions/meeting-actions");
    const mockCreate = vi.mocked(createMeeting);
    mockCreate.mockResolvedValue({ success: false, error: "保存エラー" });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" />);

    const titleInput = screen.getByPlaceholderText("話題のタイトル");
    await user.type(titleInput, "テスト話題");
    await user.click(screen.getByRole("button", { name: "1on1を保存" }));

    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.createError);
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
    expect(screen.getByRole("button", { name: "1on1を更新" })).toBeTruthy();
  });

  it("shows save button text in create mode", () => {
    render(<MeetingForm memberId="m1" />);
    expect(screen.getByRole("button", { name: "1on1を保存" })).toBeTruthy();
  });

  it("calls updateMeeting on form submit in edit mode", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: true, data: {} as never });

    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "1on1を更新" }));
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        meetingId: "meeting-1",
      }),
    );
  });

  it("calls onSuccess and shows toast after successful update", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: true, data: {} as never });

    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "1on1を更新" }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.updateSuccess);
  });

  it("shows error toast when update fails", async () => {
    const { updateMeeting } = await import("@/lib/actions/meeting-actions");
    const mockUpdate = vi.mocked(updateMeeting);
    mockUpdate.mockResolvedValue({ success: false, error: "更新エラー" });

    const user = userEvent.setup();
    render(<MeetingForm memberId="m1" initialData={mockInitialData} />);

    await user.click(screen.getByRole("button", { name: "1on1を更新" }));
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.updateError);
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

    await user.click(screen.getByRole("button", { name: "1on1を更新" }));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        deletedTopicIds: ["topic-2"],
      }),
    );
  });
});
