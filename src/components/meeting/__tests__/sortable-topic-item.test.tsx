import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SortableTopicItem } from "../sortable-topic-item";

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
  id: "topic-0",
  category: "WORK_PROGRESS",
  title: "進捗報告",
  notes: "メモ内容",
  index: 0,
  showDelete: true,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
};

describe("SortableTopicItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders drag handle, category, title, notes, and delete button", () => {
    render(<SortableTopicItem {...defaultProps} />);
    // getByTestId throws if not found, so reaching the expect means it exists
    expect(screen.getByTestId("drag-handle-topic-0")).toBeTruthy();
    expect(screen.getByDisplayValue("進捗報告")).toBeTruthy();
    // notes に値があるため詳細セクションは自動展開される
    expect(screen.getByDisplayValue("メモ内容")).toBeTruthy();
    expect(screen.getByRole("button", { name: "削除" })).toBeTruthy();
  });

  it("ドラッグハンドルに aria-label が設定されている", () => {
    render(<SortableTopicItem {...defaultProps} />);
    expect(screen.getByRole("button", { name: "進捗報告を並び替え" })).toBeTruthy();
  });

  it("タイトルが空のときドラッグハンドルに fallback aria-label が設定される", () => {
    render(<SortableTopicItem {...defaultProps} title="" />);
    expect(screen.getByRole("button", { name: "話題を並び替え" })).toBeTruthy();
  });

  it("hides delete button when showDelete is false", () => {
    render(<SortableTopicItem {...defaultProps} showDelete={false} />);
    expect(screen.queryByRole("button", { name: "削除" })).toBeNull();
  });

  it("calls onUpdate when title changes", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    const input = screen.getByDisplayValue("進捗報告");
    await user.type(input, "X");
    // Controlled component: each keystroke calls onUpdate with current value + typed char
    // Since parent doesn't update state, the input keeps prop value and appends
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "title", "進捗報告X");
  });

  it("calls onUpdate when notes change", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    // notes に値があるため詳細セクションは自動展開される
    const textarea = screen.getByDisplayValue("メモ内容");
    await user.type(textarea, "X");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "notes", "メモ内容X");
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });
});

describe("SortableTopicItem - デフォルト折りたたみ", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const emptyProps = {
    ...defaultProps,
    notes: "",
    tags: [],
  };

  it("notes が空のとき、メモは非表示", () => {
    render(<SortableTopicItem {...emptyProps} />);
    expect(screen.queryByPlaceholderText("詳細メモ")).toBeNull();
  });

  it("notes が空のとき、「詳細を追加」ボタンが表示される", () => {
    render(<SortableTopicItem {...emptyProps} />);
    expect(screen.getByRole("button", { name: /詳細を追加/ })).toBeTruthy();
  });

  it("「詳細を追加」をクリックするとメモが表示される", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...emptyProps} />);
    await user.click(screen.getByRole("button", { name: /詳細を追加/ }));
    expect(screen.getByPlaceholderText("詳細メモ")).toBeTruthy();
  });

  it("展開後に「詳細を隠す」ボタンが表示される", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...emptyProps} />);
    await user.click(screen.getByRole("button", { name: /詳細を追加/ }));
    expect(screen.getByRole("button", { name: /詳細を隠す/ })).toBeTruthy();
  });

  it("「詳細を隠す」をクリックするとメモが非表示になる", async () => {
    const user = userEvent.setup();
    render(<SortableTopicItem {...emptyProps} />);
    await user.click(screen.getByRole("button", { name: /詳細を追加/ }));
    await user.click(screen.getByRole("button", { name: /詳細を隠す/ }));
    expect(screen.queryByPlaceholderText("詳細メモ")).toBeNull();
  });

  it("notes に値があれば詳細セクションが自動展開される", () => {
    render(<SortableTopicItem {...emptyProps} notes="既存のメモ" />);
    expect(screen.getByPlaceholderText("詳細メモ")).toBeTruthy();
  });

  it("tags に値があれば詳細セクションが自動展開される", () => {
    render(
      <SortableTopicItem
        {...emptyProps}
        tags={[{ id: "tag-1", name: "重要", color: "#ff0000" }]}
      />,
    );
    expect(screen.getByPlaceholderText("詳細メモ")).toBeTruthy();
  });
});
