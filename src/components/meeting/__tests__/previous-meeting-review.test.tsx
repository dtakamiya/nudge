import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviousMeetingReview } from "../previous-meeting-review";

const meetingDate = new Date("2026-02-01T00:00:00.000Z");

const completedAction = { id: "a1", title: "完了タスク", dueDate: null };
const pendingAction = { id: "a2", title: "未完了タスク", status: "TODO", dueDate: null };

const dataWithBoth = {
  meetingId: "m1",
  meetingDate,
  completedActions: [completedAction],
  pendingActions: [pendingAction],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PreviousMeetingReview", () => {
  it("data が null の場合はメッセージを表示する", () => {
    render(<PreviousMeetingReview data={null} selectedIds={new Set()} onToggle={vi.fn()} />);
    expect(screen.getByText("前回のミーティング記録がありません")).toBeTruthy();
  });

  it("前回ミーティング日付を表示する", () => {
    render(
      <PreviousMeetingReview data={dataWithBoth} selectedIds={new Set()} onToggle={vi.fn()} />,
    );
    expect(screen.getByText(/前回/)).toBeTruthy();
  });

  it("完了アクションを表示する", () => {
    render(
      <PreviousMeetingReview data={dataWithBoth} selectedIds={new Set()} onToggle={vi.fn()} />,
    );
    expect(screen.getByText("完了タスク")).toBeTruthy();
    expect(screen.getByText("完了済み")).toBeTruthy();
  });

  it("未完了アクションを表示する", () => {
    render(
      <PreviousMeetingReview data={dataWithBoth} selectedIds={new Set()} onToggle={vi.fn()} />,
    );
    expect(screen.getByText("未完了タスク")).toBeTruthy();
    expect(screen.getByText("未完了（今回に引き継ぐ項目を選択）")).toBeTruthy();
  });

  it("未完了アクションのチェックボックスをクリックすると onToggle が呼ばれる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PreviousMeetingReview data={dataWithBoth} selectedIds={new Set()} onToggle={onToggle} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: /未完了タスク/ });
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("a2");
  });

  it("selectedIds に含まれるアクションはチェック済みで表示される", () => {
    render(
      <PreviousMeetingReview
        data={dataWithBoth}
        selectedIds={new Set(["a2"])}
        onToggle={vi.fn()}
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: /未完了タスク/ }) as HTMLInputElement;
    expect(checkbox.getAttribute("data-state")).toBe("checked");
  });

  it("選択件数が表示される", () => {
    render(
      <PreviousMeetingReview
        data={dataWithBoth}
        selectedIds={new Set(["a2"])}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("1件を今回のフォローアップ対象に設定")).toBeTruthy();
  });

  it("completedActions が空の場合は完了セクションを表示しない", () => {
    const dataOnlyPending = { ...dataWithBoth, completedActions: [] };
    render(
      <PreviousMeetingReview data={dataOnlyPending} selectedIds={new Set()} onToggle={vi.fn()} />,
    );
    expect(screen.queryByText("完了済み")).toBeNull();
  });

  it("pendingActions が空の場合は未完了セクションを表示しない", () => {
    const dataOnlyCompleted = { ...dataWithBoth, pendingActions: [] };
    render(
      <PreviousMeetingReview data={dataOnlyCompleted} selectedIds={new Set()} onToggle={vi.fn()} />,
    );
    expect(screen.queryByText(/未完了（今回に引き継ぐ/)).toBeNull();
  });
});
