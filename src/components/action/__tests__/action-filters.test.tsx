import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionFilters, buildFilterUrl } from "../action-filters";

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn().mockReturnValue(null);
const mockSearchParamsToString = vi.fn().mockReturnValue("");

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
});

describe("ActionFilters", () => {
  it("4つのフィルターセレクトが表示される（ステータス・メンバー・期限・並び順）", () => {
    render(<ActionFilters members={mockMembers} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(4);
  });

  it("空のメンバーリストでもレンダリングされる", () => {
    render(<ActionFilters members={[]} />);
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(4);
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

  // Note: Radix UI Select の onValueChange テストは jsdom 環境では
  // hasPointerCapture 非対応のため実行不可。
  // フィルターロジックは buildFilterUrl のユニットテストで検証している。
});
