import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemberListPage } from "../member-list-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

const makeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

const members = [
  {
    id: "1",
    name: "田中太郎",
    department: "エンジニアリング",
    position: "シニアエンジニア",
    _count: { actionItems: 2 },
    meetings: [{ date: makeDate(3) }],
    overdueActionCount: 0,
  },
  {
    id: "2",
    name: "鈴木花子",
    department: "マーケティング",
    position: "マネージャー",
    _count: { actionItems: 0 },
    meetings: [{ date: makeDate(20) }],
    overdueActionCount: 1,
  },
  {
    id: "3",
    name: "佐藤次郎",
    department: "エンジニアリング",
    position: "エンジニア",
    _count: { actionItems: 1 },
    meetings: [],
    overdueActionCount: 0,
  },
];

describe("MemberListPage", () => {
  it("フィルターなしで全メンバーを表示する", () => {
    render(<MemberListPage members={members} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("鈴木花子")).toBeDefined();
    expect(screen.getByText("佐藤次郎")).toBeDefined();
  });

  it("名前で検索するとマッチするメンバーだけ表示する", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const searchInput = screen.getByPlaceholderText("名前で検索...");
    await user.type(searchInput, "田中");
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.queryByText("鈴木花子")).toBeNull();
    expect(screen.queryByText("佐藤次郎")).toBeNull();
  });

  it("部署でフィルタするとマッチするメンバーだけ表示する", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const deptSelect = screen.getByRole("combobox", { name: "部署で絞り込む" });
    await user.selectOptions(deptSelect, "マーケティング");
    expect(screen.queryByText("田中太郎")).toBeNull();
    expect(screen.getByText("鈴木花子")).toBeDefined();
    expect(screen.queryByText("佐藤次郎")).toBeNull();
  });

  it("役職でフィルタするとマッチするメンバーだけ表示する", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const posSelect = screen.getByRole("combobox", { name: "役職で絞り込む" });
    await user.selectOptions(posSelect, "エンジニア");
    expect(screen.queryByText("田中太郎")).toBeNull();
    expect(screen.queryByText("鈴木花子")).toBeNull();
    expect(screen.getByText("佐藤次郎")).toBeDefined();
  });

  it("名前検索と部署フィルタを組み合わせて絞り込める", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const deptSelect = screen.getByRole("combobox", { name: "部署で絞り込む" });
    await user.selectOptions(deptSelect, "エンジニアリング");
    const searchInput = screen.getByPlaceholderText("名前で検索...");
    await user.type(searchInput, "田中");
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.queryByText("佐藤次郎")).toBeNull();
  });

  it("部署セレクトに一意の部署選択肢が表示される", () => {
    render(<MemberListPage members={members} />);
    const deptSelect = screen.getByRole("combobox", { name: "部署で絞り込む" });
    // エンジニアリングとマーケティングのオプションが存在する
    expect(deptSelect.querySelector("option[value='エンジニアリング']")).not.toBeNull();
    expect(deptSelect.querySelector("option[value='マーケティング']")).not.toBeNull();
    // エンジニアリングは2件あるが選択肢は1件だけ
    const options = deptSelect.querySelectorAll("option[value='エンジニアリング']");
    expect(options.length).toBe(1);
  });

  it("フィルター結果が0件のとき空状態メッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const searchInput = screen.getByPlaceholderText("名前で検索...");
    await user.type(searchInput, "存在しない人");
    expect(screen.getByText("条件に一致するメンバーが見つかりません")).toBeDefined();
  });

  it("メンバー数バッジを表示する", () => {
    render(<MemberListPage members={members} />);
    expect(screen.getByText("3人")).toBeDefined();
  });

  it("フィルター後はメンバー数バッジが更新される", async () => {
    const user = userEvent.setup();
    render(<MemberListPage members={members} />);
    const deptSelect = screen.getByRole("combobox", { name: "部署で絞り込む" });
    await user.selectOptions(deptSelect, "エンジニアリング");
    expect(screen.getByText("2人")).toBeDefined();
  });
});
