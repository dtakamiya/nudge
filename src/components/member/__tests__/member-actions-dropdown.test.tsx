import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemberActionsDropdown } from "../member-actions-dropdown";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/lib/actions/member-actions", () => ({
  deleteMember: vi.fn(),
}));

vi.mock("@/lib/actions/export-actions", () => ({
  getMeetingsForExport: vi.fn(),
}));

vi.mock("@/lib/export", () => ({
  formatMeetingMarkdown: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const member = {
  id: "member-1",
  name: "田中太郎",
  department: "開発部",
  position: "エンジニア",
};

describe("MemberActionsDropdown", () => {
  it("「その他」ボタンが表示される", () => {
    render(<MemberActionsDropdown member={member} />);
    expect(screen.getByRole("button", { name: /その他/ })).toBeDefined();
  });

  it("ドロップダウンを開くと「編集」「エクスポート」「削除」が表示される", async () => {
    const user = userEvent.setup();
    render(<MemberActionsDropdown member={member} />);

    await user.click(screen.getByRole("button", { name: /その他/ }));

    const menuItems = screen.getAllByRole("menuitem");
    const menuItemLabels = menuItems.map((item) => item.textContent);
    expect(menuItemLabels.some((label) => label?.includes("編集"))).toBe(true);
    expect(menuItemLabels.some((label) => label?.includes("エクスポート"))).toBe(true);
    expect(menuItemLabels.some((label) => label?.includes("削除"))).toBe(true);
  });

  it("削除メニュー項目は destructive スタイルを持つ", async () => {
    const user = userEvent.setup();
    render(<MemberActionsDropdown member={member} />);

    await user.click(screen.getByRole("button", { name: /その他/ }));

    const menuItems = screen.getAllByRole("menuitem");
    const deleteItem = menuItems.find((item) => item.textContent?.includes("削除"));
    expect(deleteItem).toBeDefined();
    expect(deleteItem?.className).toContain("text-destructive");
  });
});
