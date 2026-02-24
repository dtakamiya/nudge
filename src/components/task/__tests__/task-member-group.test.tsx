import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  cleanup();
});

import { TaskMemberGroup } from "@/components/task/task-member-group";

const defaultItem = {
  id: "item-1",
  title: "テストアクション",
  status: "TODO" as const,
  dueDate: null,
  member: { id: "member-1", name: "田中太郎" },
  meeting: { id: "meeting-1", date: new Date("2026-02-01") },
  tags: [],
};

describe("TaskMemberGroup", () => {
  it("メンバー名が表示される", () => {
    render(<TaskMemberGroup memberId="member-1" memberName="田中太郎" items={[defaultItem]} />);
    expect(screen.getByText("田中太郎")).toBeInTheDocument();
  });

  it("メンバー詳細ページへのリンクが正しい", () => {
    render(<TaskMemberGroup memberId="member-1" memberName="田中太郎" items={[defaultItem]} />);
    const links = screen.getAllByRole("link");
    const memberLink = links.find((l) => l.getAttribute("href") === "/members/member-1");
    expect(memberLink).toBeDefined();
  });

  it("アイテム数バッジが表示される", () => {
    render(<TaskMemberGroup memberId="member-1" memberName="田中太郎" items={[defaultItem]} />);
    const badges = screen.getAllByText("1");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("複数アイテムが全て表示される", () => {
    const items = [
      { ...defaultItem, id: "item-1", title: "アクション1" },
      { ...defaultItem, id: "item-2", title: "アクション2" },
    ];
    render(<TaskMemberGroup memberId="member-1" memberName="田中太郎" items={items} />);
    expect(screen.getByText("アクション1")).toBeInTheDocument();
    expect(screen.getByText("アクション2")).toBeInTheDocument();
    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThan(0);
  });
});
