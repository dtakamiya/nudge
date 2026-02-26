import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CarryoverActionList } from "../carryover-action-list";

const meetingDate = new Date("2024-09-01");

const actions = [
  { id: "1", title: "TODO タスク", status: "TODO", dueDate: new Date("2024-09-10") },
  { id: "2", title: "進行中タスク", status: "IN_PROGRESS", dueDate: null },
];

describe("CarryoverActionList", () => {
  afterEach(() => cleanup());

  it("アクションアイテムのタイトルが表示される", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={actions}
        selectedIds={new Set()}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByText("TODO タスク")).toBeInTheDocument();
    expect(screen.getByText("進行中タスク")).toBeInTheDocument();
  });

  it("TODO ステータスバッジが表示される", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={[actions[0]!]}
        selectedIds={new Set()}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByText("未着手")).toBeInTheDocument();
  });

  it("IN_PROGRESS ステータスバッジが表示される", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={[actions[1]!]}
        selectedIds={new Set()}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByText("進行中")).toBeInTheDocument();
  });

  it("期日が表示される", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={[actions[0]!]}
        selectedIds={new Set()}
        onToggle={() => {}}
      />,
    );
    // 期日の日付テキストが存在することを確認
    expect(screen.getAllByText(/2024/).length).toBeGreaterThanOrEqual(1);
  });

  it("選択済みアイテムはチェックボックスがチェックされている", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={actions}
        selectedIds={new Set(["1"])}
        onToggle={() => {}}
      />,
    );
    const checkbox = screen.getByLabelText("TODO タスクを今回のフォローアップ対象にする");
    expect(checkbox).toBeChecked();
  });

  it("チェックボックスをクリックすると onToggle が呼ばれる", async () => {
    const onToggle = vi.fn();
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={[actions[0]!]}
        selectedIds={new Set()}
        onToggle={onToggle}
      />,
    );
    const checkbox = screen.getByLabelText("TODO タスクを今回のフォローアップ対象にする");
    await userEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("選択件数メッセージが表示される", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={actions}
        selectedIds={new Set(["1", "2"])}
        onToggle={() => {}}
      />,
    );
    expect(screen.getByText("2件を今回のフォローアップ対象に設定")).toBeInTheDocument();
  });

  it("選択がない場合は件数メッセージが表示されない", () => {
    render(
      <CarryoverActionList
        meetingDate={meetingDate}
        actions={actions}
        selectedIds={new Set()}
        onToggle={() => {}}
      />,
    );
    expect(screen.queryByText(/件を今回のフォローアップ対象に設定/)).not.toBeInTheDocument();
  });
});
