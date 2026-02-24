import { fireEvent } from "@testing-library/dom";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KeyboardShortcutProvider } from "../keyboard-shortcut-provider";

const { mockPush, mockToggleFocusMode } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockToggleFocusMode: vi.fn(),
}));
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

vi.mock("@/hooks/use-focus-mode", () => ({
  useFocusMode: () => ({
    isFocusMode: false,
    toggleFocusMode: mockToggleFocusMode,
    setFocusMode: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockPathname = "/";
});

const members = [
  { id: "m1", name: "田中太郎" },
  { id: "m2", name: "鈴木花子" },
];

describe("KeyboardShortcutProvider", () => {
  describe("'n' キー — 新規メンバー追加", () => {
    it("'n' キーで /members/new にナビゲートされる", () => {
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "n" });

      expect(mockPush).toHaveBeenCalledWith("/members/new");
    });
  });

  describe("'m' キー — 新規ミーティング作成", () => {
    it("'m' キーで NewMeetingDialog が開く", () => {
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "m" });

      expect(screen.getByText("新規ミーティングを作成")).toBeDefined();
    });
  });

  describe("'?' キー — ショートカット一覧", () => {
    it("'?' キーで ShortcutHelpDialog が開く", () => {
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "?" });

      expect(screen.getByText("キーボードショートカット")).toBeDefined();
    });
  });

  describe("'f' キー — フォーカスモード切り替え", () => {
    it("'f' キーで toggleFocusMode が呼ばれる", () => {
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "f" });

      expect(mockToggleFocusMode).toHaveBeenCalledOnce();
    });
  });

  describe("コンテキスト検出", () => {
    it("グローバルページでは global context の ShortcutHelpDialog が開く", () => {
      mockPathname = "/";
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "?" });

      // グローバルセクションが表示されている
      expect(screen.getByText("グローバル")).toBeDefined();
      // global context では記録中セクションは非表示
      expect(screen.queryByText("記録中")).toBeNull();
    });

    it("ミーティング詳細ページでは recording context の ShortcutHelpDialog が開く", () => {
      mockPathname = "/members/m1/meetings/meet1";
      render(<KeyboardShortcutProvider members={members} />);

      fireEvent.keyDown(document, { key: "?" });

      // recording context では記録中セクションが表示される
      expect(screen.getByText("記録中")).toBeDefined();
      expect(screen.getByText("タイマー開始/一時停止")).toBeDefined();
    });
  });
});
