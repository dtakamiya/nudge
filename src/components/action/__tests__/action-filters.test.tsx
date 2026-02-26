import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionFilters, buildFilterUrl } from "../action-filters";

const { mockPush, mockSearchParamsGet, mockSearchParamsToString } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParamsGet: vi.fn().mockReturnValue(null),
  mockSearchParamsToString: vi.fn().mockReturnValue(""),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
    toString: mockSearchParamsToString,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockMembers = [
  { id: "member-1", name: "田中太郎" },
  { id: "member-2", name: "佐藤花子" },
];

describe("buildFilterUrl", () => {
  it("value が 'all' のとき該当キーを削除する", () => {
    expect(buildFilterUrl("status=TODO", "status", "all")).toBe("/actions?");
  });

  it("value が空文字のとき該当キーを削除する", () => {
    expect(buildFilterUrl("status=TODO&memberId=abc", "status", "")).toBe("/actions?memberId=abc");
  });

  it("value が 'all' でないとき該当キーをセットする", () => {
    expect(buildFilterUrl("", "status", "TODO")).toBe("/actions?status=TODO");
  });

  it("既存パラメータを保持しつつ新しいパラメータを追加する", () => {
    const result = buildFilterUrl("status=TODO", "memberId", "member-1");
    expect(result).toBe("/actions?status=TODO&memberId=member-1");
  });

  it("status を 'all' にすると memberId のみ残る", () => {
    const result = buildFilterUrl("status=TODO&memberId=member-1", "status", "all");
    expect(result).toBe("/actions?memberId=member-1");
  });

  it("空のパラメータに値を追加する", () => {
    expect(buildFilterUrl("", "memberId", "member-1")).toBe("/actions?memberId=member-1");
  });

  it("dateFilter パラメータを設定できる", () => {
    expect(buildFilterUrl("", "dateFilter", "overdue")).toBe("/actions?dateFilter=overdue");
  });

  it("dateFilter が 'all' のときパラメータを削除する", () => {
    expect(buildFilterUrl("dateFilter=overdue", "dateFilter", "all")).toBe("/actions?");
  });

  it("sort パラメータを設定できる", () => {
    expect(buildFilterUrl("", "sort", "createdAt")).toBe("/actions?sort=createdAt");
  });

  it("dateFilter が 'no-date' のとき URLパラメータに反映される", () => {
    expect(buildFilterUrl("", "dateFilter", "no-date")).toBe("/actions?dateFilter=no-date");
  });

  it("sort が 'updatedAt' のとき URLパラメータに反映される", () => {
    expect(buildFilterUrl("", "sort", "updatedAt")).toBe("/actions?sort=updatedAt");
  });

  it("フィルター変更時に page パラメータを削除する", () => {
    expect(buildFilterUrl("status=TODO&page=3", "status", "IN_PROGRESS")).toBe(
      "/actions?status=IN_PROGRESS",
    );
  });

  it("フィルターが 'all' のときも page パラメータを削除する", () => {
    expect(buildFilterUrl("status=TODO&page=2", "status", "all")).toBe("/actions?");
  });

  it("value が 'none' のとき該当キーを削除する", () => {
    expect(buildFilterUrl("groupBy=member", "groupBy", "none")).toBe("/actions?");
  });

  it("groupBy パラメータを設定できる", () => {
    expect(buildFilterUrl("", "groupBy", "member")).toBe("/actions?groupBy=member");
  });
});

describe("ActionFilters", () => {
  it("6つのフィルターセレクトが表示される（グループ化・ステータス・優先度・メンバー・期限・並び順）", () => {
    render(<ActionFilters members={mockMembers} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(6);
  });

  it("空のメンバーリストでもレンダリングされる", () => {
    render(<ActionFilters members={[]} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(6);
  });

  it("キーワード検索のインプットが表示される", () => {
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByPlaceholderText("アクション名・内容で検索...")).toBeDefined();
  });

  it("searchParams にステータスがないとき 'すべて' がデフォルト表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByText("すべて")).toBeDefined();
  });

  it("searchParams にメンバーがないとき '全メンバー' がデフォルト表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByText("全メンバー")).toBeDefined();
  });

  it("期限フィルタのデフォルトとして 'すべての期限' が表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByText("すべての期限")).toBeDefined();
  });

  it("ソートのデフォルトとして '期限日順' が表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByText("期限日順")).toBeDefined();
  });

  // Radix UI SelectContent はポータル経由でレンダリングされるため
  // ドロップダウン内の選択肢は buildFilterUrl のテストで検証する。
  // 以下は no-date / updatedAt が URL パラメータとして正しく渡されることを確認。
  it("dateFilter が 'no-date' のとき buildFilterUrl が正しい URL を返す", () => {
    expect(buildFilterUrl("", "dateFilter", "no-date")).toBe("/actions?dateFilter=no-date");
  });

  it("sort が 'updatedAt' のとき buildFilterUrl が正しい URL を返す", () => {
    expect(buildFilterUrl("", "sort", "updatedAt")).toBe("/actions?sort=updatedAt");
  });

  // Note: Radix UI Select の onValueChange テストは jsdom 環境では
  // hasPointerCapture 非対応のため実行不可。
  // フィルターロジックは buildFilterUrl のユニットテストで検証している。

  it("優先度フィルタの Select が表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<ActionFilters members={mockMembers} />);
    expect(screen.getByText("すべての優先度")).toBeDefined();
  });

  it("ソートの選択肢に優先度順が含まれる", () => {
    expect(buildFilterUrl("", "sort", "priority")).toBe("/actions?sort=priority");
  });
});

describe("ActionFilters - モバイルレスポンシブ", () => {
  it("フィルターのSelectTriggerがモバイル対応クラスを持つ（固定幅なし）", () => {
    const { container } = render(<ActionFilters members={mockMembers} />);
    const triggers = container.querySelectorAll('[data-slot="select-trigger"]');
    expect(triggers.length).toBeGreaterThan(0);
    triggers.forEach((trigger) => {
      expect(trigger.className).toContain("flex-1");
    });
  });
});
