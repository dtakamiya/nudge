import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MemberNoteTab } from "../member-note-tab";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/member-note-actions", () => ({
  createMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
  deleteMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

const mockNotes = [
  {
    id: "n1",
    content: "良い点メモ",
    category: "good",
    memberId: "m1",
    createdAt: new Date("2026-02-27T10:00:00Z"),
    updatedAt: new Date("2026-02-27T10:00:00Z"),
  },
  {
    id: "n2",
    content: "改善点メモ",
    category: "improvement",
    memberId: "m1",
    createdAt: new Date("2026-02-26T10:00:00Z"),
    updatedAt: new Date("2026-02-26T10:00:00Z"),
  },
];

describe("MemberNoteTab", () => {
  it("メモ一覧を表示する", () => {
    render(<MemberNoteTab notes={mockNotes} memberId="m1" />);
    expect(screen.getByText("良い点メモ")).toBeInTheDocument();
    expect(screen.getByText("改善点メモ")).toBeInTheDocument();
  });

  it("フィルタボタンが表示される", () => {
    render(<MemberNoteTab notes={mockNotes} memberId="m1" />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
  });

  it("カテゴリフィルタで絞り込める", async () => {
    render(<MemberNoteTab notes={mockNotes} memberId="m1" />);
    // フィルタ部分の「良い点」ボタンをクリック（フォーム内のとは別のボタン）
    const filterButtons = screen.getAllByRole("button", { name: "良い点" });
    // フィルタは先頭のものを使う
    await userEvent.click(filterButtons[0]);
    expect(screen.getByText("良い点メモ")).toBeInTheDocument();
    expect(screen.queryByText("改善点メモ")).not.toBeInTheDocument();
  });

  it("メモがない場合は空状態を表示する", () => {
    render(<MemberNoteTab notes={[]} memberId="m1" />);
    expect(screen.getByText(/メモがありません/)).toBeInTheDocument();
  });

  it("作成フォームが表示される", () => {
    render(<MemberNoteTab notes={[]} memberId="m1" />);
    expect(screen.getByPlaceholderText(/メモを入力/)).toBeInTheDocument();
  });
});
