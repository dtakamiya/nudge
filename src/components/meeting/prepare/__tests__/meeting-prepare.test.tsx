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

const mockLastMeetingData = {
  meetingId: "meeting-1",
  meetingDate: new Date("2026-02-17"),
  completedActions: [{ id: "c0", title: "完了済みタスク", dueDate: null }],
  pendingActions: [
    { id: "c1", title: "引き継ぎタスク1", status: "TODO", dueDate: new Date("2026-03-01") },
    { id: "c2", title: "引き継ぎタスク2", status: "IN_PROGRESS", dueDate: null },
  ],
};

describe("MeetingPrepare", () => {
  afterEach(() => cleanup());

  it("renders agenda topic input initially", () => {
    render(
      <MeetingPrepare memberId="m1" pendingActions={mockPendingActions} lastMeetingData={null} />,
    );
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it("renders pending action items when provided", () => {
    render(
      <MeetingPrepare memberId="m1" pendingActions={mockPendingActions} lastMeetingData={null} />,
    );
    // 未完了アクションセクションが表示される
    expect(screen.getByText(/未完了アクション全件/)).toBeDefined();
  });

  it("does not show pending actions section when no pending actions", () => {
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    expect(screen.queryByText(/未完了アクション全件/)).toBeNull();
  });

  it("shows empty state for previous meeting when lastMeetingData is null", () => {
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    expect(screen.getByText("前回のミーティング記録がありません")).toBeDefined();
  });

  it("renders template selector in collapsible section", () => {
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    expect(screen.getByText("テンプレートを適用")).toBeDefined();
  });

  it("can add a topic manually", async () => {
    const user = userEvent.setup();
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    await user.click(screen.getByRole("button", { name: /話題を追加/ }));
    const inputs = screen.getAllByPlaceholderText("話題のタイトル");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders start recording button", () => {
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    expect(screen.getByRole("link", { name: /記録を開始/ })).toBeDefined();
  });

  it("lastMeetingData がある場合は前回の振り返りセクションに完了・未完了が表示される", () => {
    render(
      <MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={mockLastMeetingData} />,
    );
    expect(screen.getByText("引き継ぎタスク1")).toBeDefined();
    expect(screen.getByText("引き継ぎタスク2")).toBeDefined();
    expect(screen.getByText("完了済みタスク")).toBeDefined();
  });

  it("lastMeetingData が null の場合は「前回のミーティング記録がありません」が表示される", () => {
    render(<MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={null} />);
    expect(screen.getByText("前回のミーティング記録がありません")).toBeDefined();
  });

  it("フォローアップ対象チェックで buildStartUrl に followUpActionIds が含まれる", async () => {
    const user = userEvent.setup();
    render(
      <MeetingPrepare memberId="m1" pendingActions={[]} lastMeetingData={mockLastMeetingData} />,
    );

    // 未完了アクションのチェックボックス（引き継ぎタスク1）をクリック
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]!);

    const startLink = screen.getByRole("link", { name: /記録を開始/ });
    const href = startLink.getAttribute("href") ?? "";
    expect(href).toContain("followUpActionIds");
  });
});
