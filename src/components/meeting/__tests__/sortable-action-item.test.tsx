import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableActionItem } from "../sortable-action-item";

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
  id: "action-0",
  title: "レビュー依頼",
  description: "PRレビューをする",
  dueDate: "2026-03-01",
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
    expect(screen.getByDisplayValue("2026-03-01")).toBeTruthy();
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
    const input = screen.getByDisplayValue("2026-03-01");
    // date inputs don't respond to userEvent.type in jsdom; use fireEvent.change
    fireEvent.change(input, { target: { value: "2026-04-01" } });
    expect(defaultProps.onUpdate).toHaveBeenCalledWith(0, "dueDate", "2026-04-01");
  });

  it("calls onRemove when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableActionItem {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });
});
