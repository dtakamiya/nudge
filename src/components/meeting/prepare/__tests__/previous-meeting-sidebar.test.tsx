import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviousMeetingSidebar } from "../previous-meeting-sidebar";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
  }),
}));

const mockUpdateActionItemStatus = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: (...args: unknown[]) => mockUpdateActionItemStatus(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const pendingActions = [
  {
    id: "action-1",
    title: "レビュー対応",
    status: "TODO",
    dueDate: new Date("2026-03-01"),
  },
  {
    id: "action-2",
    title: "設計書更新",
    status: "IN_PROGRESS",
    dueDate: null,
  },
];

const previousMeeting = {
  id: "meeting-1",
  date: new Date("2026-02-10"),
  topics: [
    {
      id: "topic-1",
      category: "PROGRESS",
      title: "進捗確認",
      notes: "順調に進んでいる",
    },
  ],
  actionItems: [],
};

describe("PreviousMeetingSidebar", () => {
  it("未完了アクションを表示する", () => {
    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );
    expect(screen.getByText("レビュー対応")).toBeDefined();
    expect(screen.getByText("設計書更新")).toBeDefined();
  });

  it("未完了アクションが空のとき「なし」を表示する", () => {
    render(<PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={[]} />);
    expect(screen.getByText("なし")).toBeDefined();
  });

  it("前回のミーティングの話題を表示する", () => {
    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );
    expect(screen.getByText("進捗確認")).toBeDefined();
    expect(screen.getByText("順調に進んでいる")).toBeDefined();
  });

  it("前回のミーティングがないとき「前回の記録はありません」を表示する", () => {
    render(<PreviousMeetingSidebar previousMeeting={null} pendingActions={[]} />);
    expect(screen.getByText("前回の記録はありません")).toBeDefined();
  });

  it("チェックボックスクリックで楽観的にUIが更新される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100)),
    );

    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    // 楽観的更新により即座にチェック状態になる
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
  });

  it("チェックボックスクリックでサーバーアクションが呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: true, data: {} });

    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(mockUpdateActionItemStatus).toHaveBeenCalledWith("action-1", "DONE");
  });

  it("チェックボックスに aria-label が設定されている", () => {
    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );

    expect(screen.getByLabelText("レビュー対応を完了にする")).toBeDefined();
    expect(screen.getByLabelText("設計書更新を完了にする")).toBeDefined();
  });

  it("サーバーエラー時に router.refresh でロールバックする", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: false, error: "Server error" });

    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    await vi.waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("followUpActionIds に含まれるアクションに「引き継ぎ」バッジが表示される", () => {
    render(
      <PreviousMeetingSidebar
        previousMeeting={previousMeeting}
        pendingActions={pendingActions}
        followUpActionIds={["action-1"]}
      />,
    );
    expect(screen.getByText("引き継ぎ")).toBeDefined();
  });

  it("followUpActionIds が空の場合は「引き継ぎ」バッジが表示されない", () => {
    render(
      <PreviousMeetingSidebar
        previousMeeting={previousMeeting}
        pendingActions={pendingActions}
        followUpActionIds={[]}
      />,
    );
    expect(screen.queryByText("引き継ぎ")).toBeNull();
  });

  it("followUpActionIds が指定されない場合は「引き継ぎ」バッジが表示されない", () => {
    render(
      <PreviousMeetingSidebar previousMeeting={previousMeeting} pendingActions={pendingActions} />,
    );
    expect(screen.queryByText("引き継ぎ")).toBeNull();
  });

  it("フォローアップ対象アクションが先頭に表示される", () => {
    render(
      <PreviousMeetingSidebar
        previousMeeting={previousMeeting}
        pendingActions={pendingActions}
        followUpActionIds={["action-2"]}
      />,
    );
    const items = screen.getAllByRole("checkbox");
    // action-2 (設計書更新) が先頭になる
    expect(items[0]).toHaveAttribute("aria-label", "設計書更新を完了にする");
  });
});
