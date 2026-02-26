import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionListSection } from "../action-list-section";
import type { TagData } from "../sortable-action-item";

const mockAnnouncements = {
  onDragStart: vi.fn(() => ""),
  onDragOver: vi.fn(() => ""),
  onDragEnd: vi.fn(() => ""),
  onDragCancel: vi.fn(() => ""),
};

const defaultAction = (overrides = {}) => ({
  title: "テストアクション",
  description: "",
  sortOrder: 0,
  dueDate: "",
  tags: [] as TagData[],
  ...overrides,
});

describe("ActionListSection", () => {
  afterEach(() => cleanup());

  it("アクションリストが表示される", () => {
    render(
      <ActionListSection
        actionItems={[defaultAction()]}
        actionIds={["action-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("テストアクション")).toBeTruthy();
  });

  it("「+ アクション追加」ボタンが表示される", () => {
    render(
      <ActionListSection
        actionItems={[]}
        actionIds={[]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /アクション追加/ })).toBeTruthy();
  });

  it("「+ アクション追加」ボタンクリックで onAdd が呼ばれる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <ActionListSection
        actionItems={[]}
        actionIds={[]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /アクション追加/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("アクションが空のとき「アクションはまだありません」が表示される", () => {
    render(
      <ActionListSection
        actionItems={[]}
        actionIds={[]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByText("アクションはまだありません")).toBeTruthy();
  });

  it("アクションが存在するとき空メッセージは表示されない", () => {
    render(
      <ActionListSection
        actionItems={[defaultAction()]}
        actionIds={["action-0"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.queryByText("アクションはまだありません")).toBeNull();
  });

  it("複数アクションが正しく表示される", () => {
    const actionItems = [
      defaultAction({ title: "アクション1", sortOrder: 0 }),
      defaultAction({ title: "アクション2", sortOrder: 1 }),
    ];
    render(
      <ActionListSection
        actionItems={actionItems}
        actionIds={["action-0", "action-1"]}
        sensors={[]}
        announcements={mockAnnouncements}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onTagsChange={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("アクション1")).toBeTruthy();
    expect(screen.getByDisplayValue("アクション2")).toBeTruthy();
  });
});
