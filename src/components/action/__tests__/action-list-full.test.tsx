import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { ActionListFull } from "../action-list-full";

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

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: (...args: unknown[]) => mockUpdateActionItemStatus(...args),
  updateActionItem: (...args: unknown[]) => mockUpdateActionItem(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseItems = [
  {
    id: "action-1",
    title: "レビュー依頼",
    description: "PRのレビューをする",
    status: "TODO",
    dueDate: new Date("2026-03-01"),
    member: { id: "member-1", name: "田中太郎" },
    meeting: { id: "meeting-1", date: new Date("2026-02-15") },
  },
  {
    id: "action-2",
    title: "ドキュメント更新",
    description: "",
    status: "IN_PROGRESS",
    dueDate: null,
    member: { id: "member-2", name: "佐藤花子" },
    meeting: { id: "meeting-2", date: new Date("2026-02-10") },
  },
];

describe("ActionListFull", () => {
  describe("空リスト表示", () => {
    it("メンバーなし・フィルタなし → メンバー追加ガイドを表示する", () => {
      render(<ActionListFull actionItems={[]} hasMembers={false} />);
      expect(screen.getByText("メンバーを追加して1on1を始めましょう")).toBeDefined();
    });

    it("メンバーあり・フィルタあり → 条件一致なしメッセージを表示する", () => {
      render(<ActionListFull actionItems={[]} hasMembers={true} hasFilter={true} />);
      expect(screen.getByText("条件に一致するアクションアイテムがありません")).toBeDefined();
    });

    it("メンバーあり・フィルタなし → 達成感メッセージを表示する", () => {
      render(<ActionListFull actionItems={[]} hasMembers={true} hasFilter={false} />);
      expect(screen.getByText("すべてのアクションアイテムが完了しています！")).toBeDefined();
    });

    it("デフォルト（props未指定）でメンバーあり・フィルタなし扱いになる", () => {
      render(<ActionListFull actionItems={[]} />);
      expect(screen.getByText("すべてのアクションアイテムが完了しています！")).toBeDefined();
    });

    it("メンバーなし空状態はメンバー追加ボタンリンクを含む", () => {
      render(<ActionListFull actionItems={[]} hasMembers={false} />);
      const link = screen.getByRole("link", { name: "メンバーを追加する" });
      expect(link.getAttribute("href")).toBe("/members/new");
    });
  });

  it("アクションアイテムのタイトルとメンバー名を表示する", () => {
    render(<ActionListFull actionItems={baseItems} />);
    expect(screen.getByText("レビュー依頼")).toBeDefined();
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("ドキュメント更新")).toBeDefined();
    expect(screen.getByText("佐藤花子")).toBeDefined();
  });

  it("期限日を表示する", () => {
    render(<ActionListFull actionItems={baseItems} />);
    expect(screen.getByText(/期限:/)).toBeDefined();
  });

  it("ステータスセレクトが表示される", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(2);
  });

  it("メンバーへのリンクが正しい", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const link = screen.getByText("田中太郎");
    expect(link.closest("a")?.getAttribute("href")).toBe("/members/member-1");
  });

  it("編集ボタンが各行に表示される", () => {
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    expect(editButtons.length).toBe(2);
  });

  it("編集ボタンクリックで編集フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    expect(screen.getByDisplayValue("レビュー依頼")).toBeDefined();
    expect(screen.getByRole("button", { name: /保存/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeDefined();
  });

  it("キャンセルボタンで編集モードを終了する", async () => {
    const user = userEvent.setup();
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);
    const cancelBtn = screen.getByRole("button", { name: /キャンセル/ });
    await user.click(cancelBtn);
    expect(screen.queryByDisplayValue("レビュー依頼")).toBeNull();
  });

  it("保存ボタンクリックで updateActionItem が呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue("レビュー依頼");
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
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateSuccess);
  });

  it("保存失敗時にエラートーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: false, error: "Error" });
    render(<ActionListFull actionItems={baseItems} />);
    const editButtons = screen.getAllByRole("button", { name: /編集/ });
    await user.click(editButtons[0]);

    const saveBtn = screen.getByRole("button", { name: /保存/ });
    await user.click(saveBtn);

    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateError);
  });

  describe("statusFilter プロパティ", () => {
    it("statusFilter を指定しない場合、すべてのアイテムが表示される", () => {
      render(<ActionListFull actionItems={baseItems} />);
      expect(screen.getByText("レビュー依頼")).toBeDefined();
      expect(screen.getByText("ドキュメント更新")).toBeDefined();
    });

    it("statusFilter を指定しても、渡されたアイテムはそのまま表示される", () => {
      const inProgressItems = [
        {
          id: "action-2",
          title: "ドキュメント更新",
          description: "",
          status: "IN_PROGRESS",
          dueDate: null,
          member: { id: "member-2", name: "佐藤花子" },
          meeting: { id: "meeting-2", date: new Date("2026-02-10") },
        },
      ];
      render(<ActionListFull actionItems={inProgressItems} statusFilter="IN_PROGRESS" />);
      expect(screen.getByText("ドキュメント更新")).toBeDefined();
    });

    it("statusFilter を指定して空リストの場合、hasFilter=true なら条件一致なしを表示する", () => {
      render(
        <ActionListFull actionItems={[]} statusFilter="DONE" hasMembers={true} hasFilter={true} />,
      );
      expect(screen.getByText("条件に一致するアクションアイテムがありません")).toBeDefined();
    });
  });

  // Note: Radix UI Select の onValueChange テストは jsdom 環境では
  // hasPointerCapture 非対応のため実行不可。
  // statusFilter によるステータス変更後のフィルタリング動作（楽観的更新）は E2E テストで検証する。
  // トースト通知のロジックは action-list-compact テストで検証している。

  describe("期限日バッジ", () => {
    it("期限超過（DONE以外）のアイテムに「期限超過」バッジを表示する", () => {
      const overdueItems = [
        {
          id: "overdue-1",
          title: "期限切れタスク",
          description: "",
          status: "TODO",
          dueDate: new Date("2020-01-01"),
          member: { id: "member-1", name: "田中太郎" },
          meeting: { id: "meeting-1", date: new Date("2020-01-01") },
        },
      ];
      render(<ActionListFull actionItems={overdueItems} />);
      expect(screen.getByText("期限超過")).toBeDefined();
    });

    it("期限超過でも DONE のアイテムにはバッジを表示しない", () => {
      const doneItems = [
        {
          id: "done-1",
          title: "完了タスク",
          description: "",
          status: "DONE",
          dueDate: new Date("2020-01-01"),
          member: { id: "member-1", name: "田中太郎" },
          meeting: { id: "meeting-1", date: new Date("2020-01-01") },
        },
      ];
      render(<ActionListFull actionItems={doneItems} />);
      expect(screen.queryByText("期限超過")).toBeNull();
      expect(screen.queryByText("もうすぐ期限")).toBeNull();
      expect(screen.getByText(/期限:/)).toBeDefined();
    });

    it("dueDate が null のアイテムには期限テキストを表示しない", () => {
      const noDateItems = [
        {
          id: "no-date-1",
          title: "タスクA",
          description: "",
          status: "TODO",
          dueDate: null,
          member: { id: "member-1", name: "田中太郎" },
          meeting: { id: "meeting-1", date: new Date("2026-02-01") },
        },
      ];
      render(<ActionListFull actionItems={noDateItems} />);
      expect(screen.queryByText(/期限/)).toBeNull();
    });

    it("期限3日以内（DONE以外）のアイテムに「もうすぐ期限」バッジを表示する", () => {
      // 明らかに遠い未来だが「もうすぐ期限」とはならない基準日を使う
      // getByText で存在確認するため、getDueDateStatus に依存する形でテストする
      // dueDate を2日後に固定した固定日を使用
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const dueSoonItems = [
        {
          id: "due-soon-1",
          title: "もうすぐ期限タスク",
          description: "",
          status: "TODO",
          dueDate: twoDaysFromNow,
          member: { id: "member-1", name: "田中太郎" },
          meeting: { id: "meeting-1", date: new Date("2026-01-01") },
        },
      ];
      render(<ActionListFull actionItems={dueSoonItems} />);
      expect(screen.getByText("もうすぐ期限")).toBeDefined();
    });
  });
});
