import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MemberNoteForm } from "../member-note-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/member-note-actions", () => ({
  createMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

describe("MemberNoteForm", () => {
  it("作成モードでフォームが表示される", () => {
    render(<MemberNoteForm memberId="m1" />);
    expect(screen.getByPlaceholderText(/メモを入力/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });

  it("カテゴリ選択肢が3つ表示される", () => {
    render(<MemberNoteForm memberId="m1" />);
    expect(screen.getByRole("button", { name: "良い点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "改善点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "気づき" })).toBeInTheDocument();
  });

  it("内容が空の場合は保存ボタンが無効", () => {
    render(<MemberNoteForm memberId="m1" />);
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("編集モードで既存データがセットされる", () => {
    const note = {
      id: "n1",
      content: "既存メモ",
      category: "improvement",
      memberId: "m1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    render(<MemberNoteForm memberId="m1" editingNote={note} onCancelEdit={vi.fn()} />);
    expect(screen.getByDisplayValue("既存メモ")).toBeInTheDocument();
  });

  it("編集モードでキャンセルボタンが表示される", () => {
    const note = {
      id: "n1",
      content: "既存メモ",
      category: "improvement",
      memberId: "m1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    render(<MemberNoteForm memberId="m1" editingNote={note} onCancelEdit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });
});
