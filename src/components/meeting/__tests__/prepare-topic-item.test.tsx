import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrepareTopicItem } from "../prepare-topic-item";

// Mock @dnd-kit/sortable — useSortable returns no-op values for unit tests
vi.mock("@dnd-kit/sortable", () => ({
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
  id: "draft-abc",
  category: "WORK_PROGRESS",
  title: "進捗報告",
  notes: "事前メモ",
  index: 0,
  showDelete: true,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PrepareTopicItem", () => {
  it("グリップハンドルが表示される", () => {
    render(<PrepareTopicItem {...defaultProps} />);
    expect(screen.getByTestId("prepare-drag-handle-draft-abc")).toBeTruthy();
  });

  it("タイトルが表示される", () => {
    render(<PrepareTopicItem {...defaultProps} />);
    expect(screen.getByDisplayValue("進捗報告")).toBeTruthy();
  });

  it("メモが表示される", () => {
    render(<PrepareTopicItem {...defaultProps} />);
    expect(screen.getByDisplayValue("事前メモ")).toBeTruthy();
  });

  it("showDelete=true のとき削除ボタンが表示される", () => {
    render(<PrepareTopicItem {...defaultProps} />);
    expect(screen.getByRole("button", { name: /進捗報告を削除/ })).toBeTruthy();
  });

  it("showDelete=false のとき削除ボタンが非表示", () => {
    render(<PrepareTopicItem {...defaultProps} showDelete={false} />);
    expect(screen.queryByRole("button", { name: /削除/ })).toBeNull();
  });

  it("タイトル変更で onUpdate が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PrepareTopicItem {...defaultProps} />);
    const input = screen.getByDisplayValue("進捗報告");
    await user.type(input, "X");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "title", "進捗報告X");
  });

  it("メモ変更で onUpdate が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PrepareTopicItem {...defaultProps} />);
    const textarea = screen.getByDisplayValue("事前メモ");
    await user.type(textarea, "X");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "notes", "事前メモX");
  });

  it("削除ボタンクリックで onRemove が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<PrepareTopicItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /進捗報告を削除/ }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });

  it("タイトルが空のときドラッグハンドルに fallback aria-label が設定される", () => {
    render(<PrepareTopicItem {...defaultProps} title="" />);
    expect(screen.getByRole("button", { name: "話題を並び替え" })).toBeTruthy();
  });
});
