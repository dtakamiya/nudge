import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MeetingPrepare } from "../meeting-prepare";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("radix-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("radix-ui")>();
  return {
    ...actual,
    Accordion: {
      Root: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Item: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Header: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      Trigger: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button onClick={onClick} {...props}>
          {children}
        </button>
      ),
      Content: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
    },
  };
});

const mockRecentMeetings = [
  {
    id: "meeting-1",
    date: new Date("2026-02-17"),
    topics: [
      { id: "t1", category: "WORK_PROGRESS", title: "進捗報告", notes: "順調" },
      { id: "t2", category: "CAREER", title: "キャリア相談", notes: "" },
    ],
    actionItems: [{ id: "a1", title: "資料作成", status: "TODO", dueDate: new Date("2026-02-28") }],
  },
  {
    id: "meeting-2",
    date: new Date("2026-01-20"),
    topics: [{ id: "t3", category: "OTHER", title: "先月の話題", notes: "" }],
    actionItems: [],
  },
];

const mockPendingActions = [
  {
    id: "a1",
    title: "資料作成",
    status: "TODO",
    dueDate: new Date("2026-02-28"),
    meeting: { date: new Date("2026-02-17") },
  },
  {
    id: "a2",
    title: "レビュー依頼",
    status: "IN_PROGRESS",
    dueDate: null,
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("MeetingPrepare", () => {
  afterEach(() => cleanup());

  it("renders past meetings accordion with topic titles", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        recentMeetings={mockRecentMeetings}
        pendingActions={mockPendingActions}
      />,
    );
    expect(screen.getByText("進捗報告")).toBeDefined();
    expect(screen.getByText("キャリア相談")).toBeDefined();
    expect(screen.getByText("先月の話題")).toBeDefined();
  });

  it("renders pending action items in checklist", () => {
    render(
      <MeetingPrepare
        memberId="m1"
        recentMeetings={mockRecentMeetings}
        pendingActions={mockPendingActions}
      />,
    );
    expect(screen.getByText("資料作成")).toBeDefined();
    expect(screen.getByText("レビュー依頼")).toBeDefined();
  });

  it("shows empty state when no recent meetings", () => {
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    expect(screen.getByText("過去のミーティング記録はありません")).toBeDefined();
  });

  it("shows empty state when no pending actions", () => {
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    expect(screen.getByText("未完了のアクションはありません")).toBeDefined();
  });

  it("copies topic to agenda when copy button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MeetingPrepare memberId="m1" recentMeetings={mockRecentMeetings} pendingActions={[]} />,
    );
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    await user.click(copyButtons[0]);
    // コピーされた話題がアジェンダに追加される（複数のplaceholderが存在するはず）
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    // コピーされた話題のタイトルが入力欄に反映される
    const values = inputs.map((el) => (el as HTMLInputElement).value);
    expect(values).toContain("進捗報告");
  });

  it("renders template selector", () => {
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    expect(screen.getByText("定期チェックイン")).toBeDefined();
    expect(screen.getByText("キャリア面談")).toBeDefined();
  });

  it("populates topics when template is selected", async () => {
    const user = userEvent.setup();
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    await user.click(screen.getByRole("button", { name: /定期チェックイン/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs[0]).toHaveProperty("value", "今週の進捗報告");
    expect(inputs[1]).toHaveProperty("value", "困っていること");
  });

  it("can add a topic manually", async () => {
    const user = userEvent.setup();
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders start meeting button", () => {
    render(<MeetingPrepare memberId="m1" recentMeetings={[]} pendingActions={[]} />);
    expect(screen.getByRole("link", { name: /ミーティングを開始/ })).toBeDefined();
  });
});
