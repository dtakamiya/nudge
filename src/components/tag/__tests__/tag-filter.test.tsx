import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

import { TagFilter } from "../tag-filter";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockTags = [
  { id: "tag-1", name: "フロントエンド", color: "#6366f1" },
  { id: "tag-2", name: "バックエンド", color: "#22c55e" },
  { id: "tag-3", name: "デザイン", color: "#f59e0b" },
];

describe("TagFilter", () => {
  it("Select コンポーネントが表示される", () => {
    render(<TagFilter tags={mockTags} />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("'すべて' オプションのテキストがデフォルトで表示される", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<TagFilter tags={mockTags} />);
    expect(screen.getByText("すべて")).toBeDefined();
  });

  it("空のタグリストでもレンダリングされる", () => {
    render(<TagFilter tags={[]} />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("tag パラメータがない場合 'all' がデフォルト値になる", () => {
    mockSearchParamsGet.mockReturnValue(null);
    render(<TagFilter tags={mockTags} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("data-value") ?? trigger.textContent).toContain("すべて");
  });
});
