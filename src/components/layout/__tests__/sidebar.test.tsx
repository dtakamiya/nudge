import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../sidebar";

const mockPathname = vi.fn().mockReturnValue("/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockPathname.mockReturnValue("/");
});

const mockMembers = [
  { id: "member-1", name: "田中太郎" },
  { id: "member-2", name: "佐藤花子" },
];

describe("Sidebar - ナビゲーション", () => {
  it("Nudge ロゴを表示する", () => {
    render(<Sidebar />);
    const logos = screen.getAllByText("Nudge");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("3つのナビリンクを表示する", () => {
    render(<Sidebar />);
    expect(screen.getByText("ダッシュボード")).toBeDefined();
    expect(screen.getByText("メンバー追加")).toBeDefined();
    expect(screen.getByText("アクション一覧")).toBeDefined();
  });

  it("パスが / のとき ダッシュボード がアクティブになる", () => {
    mockPathname.mockReturnValue("/");
    render(<Sidebar />);
    const link = screen.getAllByText("ダッシュボード")[0].closest("a");
    expect(link?.className).toContain("bg-primary/10");
  });

  it("パスが /actions のとき アクション一覧 がアクティブになる", () => {
    mockPathname.mockReturnValue("/actions");
    render(<Sidebar />);
    const link = screen.getAllByText("アクション一覧")[0].closest("a");
    expect(link?.className).toContain("bg-primary/10");
  });

  it("パスが /members/new のとき メンバー追加 がアクティブになる", () => {
    mockPathname.mockReturnValue("/members/new");
    render(<Sidebar />);
    const link = screen.getAllByText("メンバー追加")[0].closest("a");
    expect(link?.className).toContain("bg-primary/10");
  });

  it("パスが / のとき ダッシュボード 以外はアクティブでない", () => {
    mockPathname.mockReturnValue("/");
    render(<Sidebar />);
    const actionsLink = screen.getAllByText("アクション一覧")[0].closest("a");
    expect(actionsLink?.className).not.toContain("bg-primary/10");
  });

  it("パスが /members/123 のとき /members/new はアクティブでない", () => {
    mockPathname.mockReturnValue("/members/123");
    render(<Sidebar />);
    const memberLink = screen.getAllByText("メンバー追加")[0].closest("a");
    expect(memberLink?.className).not.toContain("bg-primary/10");
  });
});

describe("Sidebar - アクションバッジ", () => {
  it("actionCount が未指定のとき バッジを表示しない", () => {
    render(<Sidebar />);
    // バッジ要素がないこと（数値テキストがない）
    const navArea = screen.getByText("アクション一覧").closest("nav");
    expect(navArea?.querySelectorAll("span.rounded-full").length).toBe(0);
  });

  it("actionCount が 0 のとき バッジを表示しない", () => {
    render(<Sidebar actionCount={0} />);
    const navArea = screen.getByText("アクション一覧").closest("nav");
    expect(navArea?.querySelectorAll("span.rounded-full").length).toBe(0);
  });

  it("actionCount が正の値のとき バッジを表示する", () => {
    render(<Sidebar actionCount={5} />);
    expect(screen.getByText("5")).toBeDefined();
  });

  it("actionCount のバッジは アクション一覧 リンク内に表示される", () => {
    render(<Sidebar actionCount={3} />);
    const actionsLink = screen.getAllByText("アクション一覧")[0].closest("a");
    expect(actionsLink?.querySelector("span")).not.toBeNull();
    expect(actionsLink?.textContent).toContain("3");
  });
});

describe("Sidebar - メンバーリスト", () => {
  it("メンバーが存在するとき名前を表示する", () => {
    render(<Sidebar members={mockMembers} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("佐藤花子")).toBeDefined();
  });

  it("メンバーが存在するとき「メンバー」セクションラベルを表示する", () => {
    render(<Sidebar members={mockMembers} />);
    expect(screen.getByText("メンバー")).toBeDefined();
  });

  it("メンバーが空のとき メンバーセクションを表示しない", () => {
    render(<Sidebar members={[]} />);
    expect(screen.queryByText("メンバー")).toBeNull();
  });

  it("メンバーリンクが /members/:id に設定されている", () => {
    render(<Sidebar members={mockMembers} />);
    const link = screen.getByText("田中太郎").closest("a");
    expect(link?.getAttribute("href")).toBe("/members/member-1");
  });
});

describe("Sidebar - モバイル", () => {
  it("モバイルトップバーに Nudge ロゴを表示する", () => {
    render(<Sidebar />);
    const logos = screen.getAllByText("Nudge");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("メニューを開くボタンが表示される", () => {
    render(<Sidebar />);
    expect(screen.getByRole("button", { name: "メニューを開く" })).toBeDefined();
  });

  it("ハンバーガーボタンをクリックするとオーバーレイが開く", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const openButton = screen.getByRole("button", { name: "メニューを開く" });
    await user.click(openButton);

    expect(screen.getByRole("button", { name: "メニューを閉じる" })).toBeDefined();
  });

  it("閉じるボタンをクリックするとオーバーレイが閉じる", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const openButton = screen.getByRole("button", { name: "メニューを開く" });
    await user.click(openButton);

    const closeButton = screen.getByRole("button", { name: "メニューを閉じる" });
    await user.click(closeButton);

    expect(screen.queryByRole("button", { name: "メニューを閉じる" })).toBeNull();
  });

  it("オーバーレイ表示中にナビリンクをクリックするとオーバーレイが閉じる", async () => {
    const user = userEvent.setup();
    mockPathname.mockReturnValue("/actions");
    render(<Sidebar />);

    const openButton = screen.getByRole("button", { name: "メニューを開く" });
    await user.click(openButton);

    // オーバーレイ内のナビリンクをクリック（ダッシュボードリンク）
    // DOM 順序: モバイルオーバーレイ[0] → デスクトップサイドバー[1]
    // onNavigate は モバイルオーバーレイ側のみ設定されているため index 0 を使用
    const dashboardLinks = screen.getAllByText("ダッシュボード");
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(2);

    // jsdom環境ではhref付きaタグのnavigation模擬に制限があるため fireEvent を使用
    fireEvent.click(dashboardLinks[0]);

    expect(screen.queryByRole("button", { name: "メニューを閉じる" })).toBeNull();
  });

  it("オーバーレイ表示中にメンバーリンクをクリックするとオーバーレイが閉じる", async () => {
    const user = userEvent.setup();
    render(<Sidebar members={mockMembers} />);

    const openButton = screen.getByRole("button", { name: "メニューを開く" });
    await user.click(openButton);

    // DOM 順序: モバイルオーバーレイ[0] → デスクトップサイドバー[1]
    // onNavigate は モバイルオーバーレイ側のみ設定されているため index 0 を使用
    const memberLinks = screen.getAllByText("田中太郎");
    // jsdom環境ではhref付きaタグのnavigation模擬に制限があるため fireEvent を使用
    fireEvent.click(memberLinks[0]);

    expect(screen.queryByRole("button", { name: "メニューを閉じる" })).toBeNull();
  });
});
