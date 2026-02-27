import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SortableActionItem } from "../sortable-action-item";

// Mock @dnd-kit/sortable — useSortable returns no-op values for unit tests

// Mock DatePicker to behave like a simple date input for unit tests
vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const defaultProps = {
  id: "action-0",
  title: "レビュー依頼",
  description: "PRレビューをする",
  dueDate: "2026-03-01",
  priority: "MEDIUM" as const,
  index: 0,
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
};

describe("SortableActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders drag handle, title, description, dueDate, and delete button", () => {
    render(<SortableActionItem {...defaultProps} />);
    // getByTestId throws if not found, so reaching the expect means it exists
    expect(screen.getByTestId("drag-handle-action-0")).toBeTruthy();
    expect(screen.getByDisplayValue("レビュー依頼")).toBeTruthy();
    expect(screen.getByDisplayValue("PRレビューをする")).toBeTruthy();
    // レスポンシブレイアウトでデスクトップ用・モバイル用の2つの期限入力がある
    expect(screen.getAllByDisplayValue("2026-03-01").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "削除" })).toBeTruthy();
  });

  it("ドラッグハンドルに aria-label が設定されている", () => {
    render(<SortableActionItem {...defaultProps} />);
    expect(screen.getByRole("button", { name: "レビュー依頼を並び替え" })).toBeTruthy();
  });

  it("タイトルが空のときドラッグハンドルに fallback aria-label が設定される", () => {
    render(<SortableActionItem {...defaultProps} title="" />);
    expect(screen.getByRole("button", { name: "アクションアイテムを並び替え" })).toBeTruthy();
  });

  it("calls onUpdate when title changes", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    const input = screen.getByDisplayValue("レビュー依頼");
    await user.type(input, "X");
    // Controlled component: each keystroke calls onUpdate with current value + typed char
    // Since parent doesn't update state, the input keeps prop value and appends
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "title", "レビュー依頼X");
  });

  it("calls onUpdate when description changes", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    const input = screen.getByDisplayValue("PRレビューをする");
    await user.type(input, "X");
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "description", "PRレビューをするX");
  });

  it("calls onUpdate when dueDate changes", () => {
    render(<SortableActionItem {...defaultProps} />);
    // レスポンシブレイアウトでデスクトップ用・モバイル用の2つの期限入力がある
    const inputs = screen.getAllByDisplayValue("2026-03-01");
    // date inputs don't respond to userEvent.type in jsdom; use fireEvent.change
    fireEvent.change(inputs[0], { target: { value: "2026-04-01" } });
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "dueDate", "2026-04-01");
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });

  it("ドラッグハンドルに p-2 のタッチエリアが設定されている", () => {
    render(<SortableActionItem {...defaultProps} />);
    const handle = screen.getByTestId("drag-handle-action-0");
    expect(handle.className).toContain("p-2");
  });

  it("削除ボタンにモバイル用タッチターゲットが設定されている", () => {
    render(<SortableActionItem {...defaultProps} />);
    const deleteBtn = screen.getByRole("button", { name: "削除" });
    expect(deleteBtn.className).toContain("min-h-[44px]");
  });

  it("フォーム行に flex-wrap クラスが設定されている", () => {
    render(<SortableActionItem {...defaultProps} />);
    const handle = screen.getByTestId("drag-handle-action-0");
    const formRow = handle.parentElement;
    expect(formRow?.className).toContain("flex-wrap");
  });
});
