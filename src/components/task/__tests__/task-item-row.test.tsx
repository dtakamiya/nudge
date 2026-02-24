import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TaskItemRow } from "@/components/task/task-item-row";

afterEach(() => {
  cleanup();
});

const defaultProps = {
  title: "テストアクション",
  status: "TODO" as const,
  dueDate: null,
  memberId: "member-1",
  meetingId: "meeting-1",
  tags: [],
};

describe("TaskItemRow", () => {
  it("タイトルが表示される", () => {
    render(<TaskItemRow {...defaultProps} />);
    expect(screen.getByText("テストアクション")).toBeInTheDocument();
  });

  it("ミーティング詳細ページへのリンクが正しい", () => {
    render(<TaskItemRow {...defaultProps} />);
    const links = screen.getAllByRole("link");
    // 少なくとも1つのリンクが存在し、正しい href を持つ
    const mainLink = links.find((link) =>
      link.getAttribute("href")?.includes("/members/member-1/meetings/meeting-1"),
    );
    expect(mainLink).toBeInTheDocument();
  });

  it("タグが表示される", () => {
    const tags = [{ id: "tag-1", name: "重要", color: "#ff0000" }];
    render(<TaskItemRow {...defaultProps} tags={tags} />);
    expect(screen.getByText("重要")).toBeInTheDocument();
  });

  it("期限超過の場合に期限超過バッジが表示される", () => {
    const dueDate = new Date("2026-02-20"); // 過去の日付
    render(<TaskItemRow {...defaultProps} dueDate={dueDate} />);
    expect(screen.getByText("期限超過")).toBeInTheDocument();
  });
});
