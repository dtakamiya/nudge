import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { KeyboardShortcutProvider } from "../keyboard-shortcut-provider";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
});
