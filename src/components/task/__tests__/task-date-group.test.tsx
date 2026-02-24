import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TaskDateGroup } from "@/components/task/task-date-group";
import type { TaskDateGroup as TaskDateGroupType } from "@/lib/group-tasks";

afterEach(() => {
  cleanup();
});

function makeGroup(overrides: Partial<TaskDateGroupType> = {}): TaskDateGroupType {
  return {
    key: "overdue",
    label: "期限超過",
    isOverdue: true,
    items: [
      {
        id: "item-1",
        title: "テストアクション",
        status: "TODO",
        dueDate: new Date("2026-02-20"),
        member: { id: "member-1", name: "田中太郎" },
        meeting: { id: "meeting-1", date: new Date("2026-02-01") },
        tags: [],
      },
    ],
    ...overrides,
  };
}

describe("TaskDateGroup", () => {
  it("グループラベルが表示される", () => {
    render(<TaskDateGroup group={makeGroup()} />);
    // h2 要素としてラベルが表示されていることを確認
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("期限超過");
  });

  it("期限超過グループにはアラートアイコンが表示される", () => {
    const { container } = render(<TaskDateGroup group={makeGroup({ isOverdue: true })} />);
    // AlertCircle アイコンが存在することを確認（SVG要素）
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("通常グループには赤色スタイルが適用されない", () => {
    const { container } = render(
      <TaskDateGroup group={makeGroup({ key: "today", label: "今日", isOverdue: false })} />,
    );
    const header = container.querySelector(".bg-destructive\\/10");
    expect(header).toBeNull();
  });

  it("アイテム数のバッジが表示される", () => {
    render(<TaskDateGroup group={makeGroup()} />);
    // グループヘッダーのアイテム数 span を確認（グループヘッダー内の span）
    const countSpans = screen
      .getAllByText("1")
      .filter(
        (el) =>
          el.tagName === "SPAN" &&
          el.className.includes("ml-auto") &&
          el.className.includes("text-xs"),
      );
    expect(countSpans.length).toBeGreaterThan(0);
  });

  it("アイテムのタイトルが表示される", () => {
    render(<TaskDateGroup group={makeGroup()} />);
    const titles = screen.getAllByText("テストアクション");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("メンバー名が表示される", () => {
    render(<TaskDateGroup group={makeGroup()} />);
    const memberNames = screen.getAllByText("田中太郎");
    expect(memberNames.length).toBeGreaterThan(0);
  });
});
