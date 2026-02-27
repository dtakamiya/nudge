import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MemberNoteCard } from "../member-note-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/member-note-actions", () => ({
  deleteMemberNote: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

const mockNote = {
  id: "note-1",
  content: "プレゼンが上手だった",
  category: "good",
  memberId: "member-1",
  createdAt: new Date("2026-02-27T10:00:00Z"),
  updatedAt: new Date("2026-02-27T10:00:00Z"),
};

describe("MemberNoteCard", () => {
  it("メモの内容とカテゴリバッジを表示する", () => {
    render(<MemberNoteCard note={mockNote} onEdit={vi.fn()} />);
    expect(screen.getByText("プレゼンが上手だった")).toBeInTheDocument();
    expect(screen.getByText("良い点")).toBeInTheDocument();
  });

  it("編集ボタンをクリックすると onEdit が呼ばれる", async () => {
    const onEdit = vi.fn();
    render(<MemberNoteCard note={mockNote} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText("編集"));
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it("削除ボタンをクリックすると確認UIが表示される", async () => {
    render(<MemberNoteCard note={mockNote} onEdit={vi.fn()} />);
    await userEvent.click(screen.getByLabelText("削除"));
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "戻す" })).toBeInTheDocument();
  });

  it("日付が表示される", () => {
    render(<MemberNoteCard note={mockNote} onEdit={vi.fn()} />);
    // 2026/02/27 or 2026年2月27日 のどちらかの形式で表示
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
