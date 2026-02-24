import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { ActionListCompact } from "../action-list-compact";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUpdateActionItemStatus = vi.fn();
const mockUpdateActionItem = vi.fn();
const mockCreateActionItemForMeeting = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: (...args: unknown[]) => mockUpdateActionItemStatus(...args),
  updateActionItem: (...args: unknown[]) => mockUpdateActionItem(...args),
  createActionItemForMeeting: (...args: unknown[]) => mockCreateActionItemForMeeting(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseItems = [
  {
    id: "action-1",
    title: "テストタスク1",
    description: "説明1",
    status: "TODO",
    dueDate: new Date("2026-03-01"),
    meeting: { date: new Date("2026-02-15") },
  },
  {
    id: "action-2",
    title: "テストタスク2",
    description: "",
    status: "IN_PROGRESS",
    dueDate: null,
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("ActionListCompact", () => {
  it("空リストのときメッセージを表示する", () => {
    render(<ActionListCompact actionItems={[]} />);
    expect(screen.getByText("アクションアイテムはありません")).toBeDefined();
  });

  it("アクションアイテムのタイトルを表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText("テストタスク1")).toBeDefined();
    expect(screen.getByText("テストタスク2")).toBeDefined();
  });

  it("ステータスバッジを表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText("未着手")).toBeDefined();
    expect(screen.getByText("進行中")).toBeDefined();
  });

  it("期限日を表示する", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    expect(screen.getByText(/期限:/)).toBeDefined();
  });

  it("ステータスクリックで楽観的にUIが更新される", async () => {
    const user = userEvent.setup();
    // サーバーの応答を遅延させる
    mockUpdateActionItemStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100)),
    );

    render(<ActionListCompact actionItems={baseItems} />);

    // TODO → IN_PROGRESS に遷移
    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    // 楽観的更新により即座に「進行中」に変わる
    const progressBadges = screen.getAllByText("進行中");
    expect(progressBadges.length).toBe(2);
  });

  it("ステータス変更でサーバーアクションが呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: true, data: {} });

    render(<ActionListCompact actionItems={baseItems} />);

    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    expect(mockUpdateActionItemStatus).toHaveBeenCalledWith("action-1", "IN_PROGRESS");
  });

  it("IN_PROGRESS → DONE に遷移する", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: true, data: {} });

    render(<ActionListCompact actionItems={baseItems} />);

    const progressButton = screen.getByText("進行中").closest("button")!;
    await user.click(progressButton);

    expect(mockUpdateActionItemStatus).toHaveBeenCalledWith("action-2", "DONE");
  });

  it("サーバーエラー時にエラートーストが表示され router.refresh でロールバックする", async () => {
    const user = userEvent.setup();
    mockUpdateActionItemStatus.mockResolvedValue({ success: false, error: "Server error" });

    render(<ActionListCompact actionItems={baseItems} />);

    const todoButton = screen.getByText("未着手").closest("button")!;
    await user.click(todoButton);

    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.statusChangeError);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("ステータスボタンに aria-label が設定されている", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    // TODO → 次は IN_PROGRESS
    expect(
      screen.getByRole("button", { name: "テストタスク1のステータスを進行中に変更" }),
    ).toBeDefined();
    // IN_PROGRESS → 次は DONE
    expect(
      screen.getByRole("button", { name: "テストタスク2のステータスを完了に変更" }),
    ).toBeDefined();
  });

  it("編集ボタンが各行に表示される", () => {
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    expect(editButtons.length).toBe(2);
  });

  it("編集ボタンクリックで編集フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    expect(screen.getByDisplayValue("テストタスク1")).toBeDefined();
    expect(screen.getByRole("button", { name: /保存/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeDefined();
  });

  it("キャンセルボタンで編集モードを終了する", async () => {
    const user = userEvent.setup();
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    const cancelBtn = screen.getByRole("button", { name: /キャンセル/ });
    await user.click(cancelBtn);
    expect(screen.queryByDisplayValue("テストタスク1")).toBeNull();
  });

  it("保存ボタンクリックで updateActionItem が呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue("テストタスク1");
    await user.clear(titleInput);
    await user.type(titleInput, "更新タイトル");

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(mockUpdateActionItem).toHaveBeenCalledWith(
      "action-1",
      expect.objectContaining({ title: "更新タイトル" }),
    );
  });

  it("保存成功時にトーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateSuccess);
  });

  it("保存失敗時にエラートーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: false, error: "Error" });
    render(<ActionListCompact actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateError);
  });

  describe("アクション追加フォーム", () => {
    it("meetingId が指定されたとき追加ボタンが表示される", () => {
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      expect(screen.getByRole("button", { name: /アクション追加/ })).toBeDefined();
    });

    it("meetingId が指定されないとき追加ボタンが表示されない", () => {
      render(<ActionListCompact actionItems={baseItems} />);
      expect(screen.queryByRole("button", { name: /アクション追加/ })).toBeNull();
    });

    it("追加ボタンクリックでインラインフォームが表示される", async () => {
      const user = userEvent.setup();
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      expect(screen.getByPlaceholderText("アクションのタイトル")).toBeDefined();
    });

    it("タイトルが空の場合、保存ボタンが無効になる", async () => {
      const user = userEvent.setup();
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      const addBtn = screen.getByRole("button", { name: /追加/ });
      expect(addBtn).toHaveProperty("disabled", true);
    });

    it("保存ボタンクリックで createActionItemForMeeting が呼ばれる", async () => {
      const user = userEvent.setup();
      mockCreateActionItemForMeeting.mockResolvedValue({ success: true, data: {} });
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      await user.type(screen.getByPlaceholderText("アクションのタイトル"), "新しいタスク");
      await user.click(screen.getByRole("button", { name: /追加/ }));
      expect(mockCreateActionItemForMeeting).toHaveBeenCalledWith(
        "meeting-1",
        "member-1",
        expect.objectContaining({ title: "新しいタスク" }),
      );
    });

    it("追加成功時にトーストが表示される", async () => {
      const user = userEvent.setup();
      mockCreateActionItemForMeeting.mockResolvedValue({ success: true, data: {} });
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      await user.type(screen.getByPlaceholderText("アクションのタイトル"), "新しいタスク");
      await user.click(screen.getByRole("button", { name: /追加/ }));
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.createSuccess);
    });

    it("追加失敗時にエラートーストが表示される", async () => {
      const user = userEvent.setup();
      mockCreateActionItemForMeeting.mockResolvedValue({ success: false, error: "Error" });
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      await user.type(screen.getByPlaceholderText("アクションのタイトル"), "新しいタスク");
      await user.click(screen.getByRole("button", { name: /追加/ }));
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.createError);
    });

    it("キャンセルボタンでフォームが閉じる", async () => {
      const user = userEvent.setup();
      render(
        <ActionListCompact actionItems={baseItems} meetingId="meeting-1" memberId="member-1" />,
      );
      await user.click(screen.getByRole("button", { name: /アクション追加/ }));
      expect(screen.getByPlaceholderText("アクションのタイトル")).toBeDefined();
      await user.click(screen.getByRole("button", { name: /キャンセル/ }));
      expect(screen.queryByPlaceholderText("アクションのタイトル")).toBeNull();
    });

    it("アイテムが空のとき meetingId があれば追加ボタンが表示される", () => {
      render(<ActionListCompact actionItems={[]} meetingId="meeting-1" memberId="member-1" />);
      expect(screen.getByRole("button", { name: /アクション追加/ })).toBeDefined();
    });
  });

  describe("期限日バッジ", () => {
    it("期限超過（DONE以外）のアイテムに「期限超過」バッジを表示する", () => {
      const overdueItems = [
        {
          id: "overdue-1",
          title: "期限切れタスク",
          description: "",
          status: "TODO",
          dueDate: new Date("2020-01-01"),
          meeting: { date: new Date("2020-01-01") },
        },
      ];
      render(<ActionListCompact actionItems={overdueItems} />);
      expect(screen.getByText("期限超過")).toBeDefined();
    });

    it("期限3日以内（DONE以外）のアイテムに「もうすぐ期限」バッジを表示する", () => {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const dueSoonItems = [
        {
          id: "due-soon-1",
          title: "もうすぐ期限タスク",
          description: "",
          status: "TODO",
          dueDate: twoDaysFromNow,
          meeting: { date: new Date("2026-01-01") },
        },
      ];
      render(<ActionListCompact actionItems={dueSoonItems} />);
      expect(screen.getByText("もうすぐ期限")).toBeDefined();
    });

    it("DONE のアイテムには期限超過バッジを表示しない", () => {
      const doneItems = [
        {
          id: "done-1",
          title: "完了タスク",
          description: "",
          status: "DONE",
          dueDate: new Date("2020-01-01"),
          meeting: { date: new Date("2020-01-01") },
        },
      ];
      render(<ActionListCompact actionItems={doneItems} />);
      expect(screen.queryByText("期限超過")).toBeNull();
      expect(screen.queryByText("もうすぐ期限")).toBeNull();
      expect(screen.getByText(/期限:/)).toBeDefined();
    });

    it("期限が4日以上先のアイテムには通常の期限テキストを表示する", () => {
      const farFuture = new Date("2099-12-31");
      const normalItems = [
        {
          id: "normal-1",
          title: "余裕のあるタスク",
          description: "",
          status: "TODO",
          dueDate: farFuture,
          meeting: { date: new Date("2026-01-01") },
        },
      ];
      render(<ActionListCompact actionItems={normalItems} />);
      expect(screen.getByText(/期限:/)).toBeDefined();
      expect(screen.queryByText("期限超過")).toBeNull();
      expect(screen.queryByText("もうすぐ期限")).toBeNull();
    });
  });
});
