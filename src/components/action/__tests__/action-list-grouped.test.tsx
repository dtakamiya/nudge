import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionListGrouped } from "../action-list-grouped";

// ActionListFull をモック（グループ化ロジックのテストに集中）
vi.mock("../action-list-full", () => ({
  ActionListFull: ({ actionItems }: { actionItems: { id: string; title: string }[] }) => (
    <ul data-testid="action-list-full">
      {actionItems.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  ),
}));

const mockRouter = { push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeItem(id: string, memberName: string, memberId: string) {
  return {
    id,
    title: `アクション ${id}`,
    description: "",
    status: "TODO",
    dueDate: null,
    member: { id: memberId, name: memberName },
    meeting: { id: "meet-1", date: new Date("2024-01-01") },
    tags: [],
  };
}

const sampleItems = [
  makeItem("1", "田中太郎", "m1"),
  makeItem("2", "佐藤花子", "m2"),
  makeItem("3", "田中太郎", "m1"),
];

describe("ActionListGrouped", () => {
  describe("メンバー別グループ化", () => {
    it("メンバー名のグループヘッダーを表示する", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      expect(screen.getByText("田中太郎")).toBeDefined();
      expect(screen.getByText("佐藤花子")).toBeDefined();
    });

    it("各グループヘッダーに件数バッジを表示する", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      // 田中 2件、佐藤 1件
      expect(screen.getByText("2")).toBeDefined();
      expect(screen.getByText("1")).toBeDefined();
    });

    it("グループ内に ActionListFull が表示される", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      const lists = screen.getAllByTestId("action-list-full");
      expect(lists).toHaveLength(2);
    });

    it("グループはデフォルトで展開されている", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      expect(screen.getByText("アクション 1")).toBeDefined();
      expect(screen.getByText("アクション 2")).toBeDefined();
    });
  });

  describe("折りたたみ機能", () => {
    it("グループヘッダーをクリックすると折りたたまれる", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      const tanakaHeader = screen.getByRole("button", { name: /田中太郎/ });
      fireEvent.click(tanakaHeader);
      // 田中グループ内のアイテムが非表示になる
      expect(screen.queryByText("アクション 1")).toBeNull();
      expect(screen.queryByText("アクション 3")).toBeNull();
      // 佐藤グループは展開されたまま
      expect(screen.getByText("アクション 2")).toBeDefined();
    });

    it("折りたたんだグループを再クリックすると展開される", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="member" />);
      const header = screen.getByRole("button", { name: /田中太郎/ });
      fireEvent.click(header); // 折りたたむ
      fireEvent.click(header); // 展開する
      expect(screen.getByText("アクション 1")).toBeDefined();
    });
  });

  describe("期限別グループ化", () => {
    it("期限なしアイテムで '期限なし' グループを表示する", () => {
      const items = [makeItem("1", "田中", "m1")]; // dueDate: null
      render(<ActionListGrouped actionItems={items} groupBy="dueDate" />);
      expect(screen.getByText("期限なし")).toBeDefined();
    });
  });

  describe("タグ別グループ化", () => {
    it("タグなしアイテムで 'タグなし' グループを表示する", () => {
      render(<ActionListGrouped actionItems={sampleItems} groupBy="tag" />);
      expect(screen.getByText("タグなし")).toBeDefined();
    });
  });

  describe("エッジケース", () => {
    it("空のアイテムリストでEmptyStateを表示する", () => {
      render(<ActionListGrouped actionItems={[]} groupBy="member" />);
      expect(screen.getByText("アクションアイテムはありません")).toBeDefined();
    });

    it("空のアイテムリストのEmptyStateに説明文を表示する", () => {
      render(<ActionListGrouped actionItems={[]} groupBy="member" />);
      expect(
        screen.getByText("1on1でアクションアイテムを作成すると、ここに表示されます"),
      ).toBeDefined();
    });

    it("groupBy が none のとき何も表示しない", () => {
      const { container } = render(<ActionListGrouped actionItems={sampleItems} groupBy="none" />);
      expect(container.firstChild).toBeNull();
    });
  });
});
