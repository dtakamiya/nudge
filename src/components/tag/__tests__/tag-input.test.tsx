import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Server Action のモック
vi.mock("@/lib/actions/tag-actions", () => ({
  getTagSuggestions: vi.fn().mockResolvedValue([
    { id: "tag-1", name: "フロントエンド", color: "#6366f1" },
    { id: "tag-2", name: "バックエンド", color: "#22c55e" },
  ]),
}));

import { TagInput } from "../tag-input";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TagInput", () => {
  it("入力フィールドが表示される", () => {
    render(<TagInput selectedTags={[]} onTagsChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("placeholder が表示される", () => {
    render(<TagInput selectedTags={[]} onTagsChange={vi.fn()} placeholder="タグを追加..." />);
    expect(screen.getByPlaceholderText("タグを追加...")).toBeDefined();
  });

  it("選択済みタグが TagBadge として表示される", () => {
    const selectedTags = [{ id: "tag-1", name: "フロントエンド", color: "#6366f1" }];
    render(<TagInput selectedTags={selectedTags} onTagsChange={vi.fn()} />);
    expect(screen.getByText("フロントエンド")).toBeDefined();
  });

  it("複数の選択済みタグが表示される", () => {
    const selectedTags = [
      { id: "tag-1", name: "フロントエンド", color: "#6366f1" },
      { id: "tag-2", name: "バックエンド", color: "#22c55e" },
    ];
    render(<TagInput selectedTags={selectedTags} onTagsChange={vi.fn()} />);
    expect(screen.getByText("フロントエンド")).toBeDefined();
    expect(screen.getByText("バックエンド")).toBeDefined();
  });

  it("X ボタンクリックでタグが削除される", async () => {
    const user = userEvent.setup();
    const onTagsChange = vi.fn();
    const selectedTags = [{ id: "tag-1", name: "フロントエンド", color: "#6366f1" }];
    render(<TagInput selectedTags={selectedTags} onTagsChange={onTagsChange} />);
    const removeButton = screen.getByRole("button", { name: "フロントエンド を削除" });
    await user.click(removeButton);
    expect(onTagsChange).toHaveBeenCalledWith([]);
  });

  it("選択済みタグが空のとき削除ボタンなし", () => {
    render(<TagInput selectedTags={[]} onTagsChange={vi.fn()} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
