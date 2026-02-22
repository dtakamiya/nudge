import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { MeetingDetailPageClient } from "../meeting-detail-page-client";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/actions/meeting-actions", () => ({
  updateMeeting: vi.fn(),
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

// Mock dnd-kit
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
  arrayMove: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const defaultProps = {
  meetingId: "meeting-1",
  memberId: "member-1",
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

  it("switches back to view mode, refreshes, and shows toast on successful save", async () => {
    const user = userEvent.setup();
    render(<MeetingDetailPageClient {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /編集/ }));
    await user.click(screen.getByRole("button", { name: "mock-save" }));
    expect(screen.getByTestId("meeting-detail")).toBeTruthy();
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.meeting.updateSuccess);
  });
});
