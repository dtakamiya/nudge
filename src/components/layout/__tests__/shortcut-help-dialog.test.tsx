import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShortcutHelpDialog } from "../shortcut-help-dialog";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ShortcutHelpDialog", () => {
  describe("表示", () => {
    it("open=true のとき全ショートカットが表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} />);

      expect(screen.getByText("新規メンバーを追加")).toBeDefined();
      expect(screen.getByText("新規ミーティングを作成")).toBeDefined();
      expect(screen.getByText("検索")).toBeDefined();
      expect(screen.getByText("ショートカット一覧を表示")).toBeDefined();
    });

    it("open=false のとき内容が表示されない", () => {
      render(<ShortcutHelpDialog open={false} onClose={() => {}} />);

      expect(screen.queryByText("新規メンバーを追加")).toBeNull();
    });

    it("キーボードショートカットキーが kbd 要素として表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} />);

      const kbdElements = screen.getAllByRole("term");
      expect(kbdElements.length).toBeGreaterThan(0);
    });

    it("ダイアログタイトルが表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} />);

      expect(screen.getByText("キーボードショートカット")).toBeDefined();
    });
  });

  describe("クローズ動作", () => {
    it("閉じるボタンで onClose が呼ばれる", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<ShortcutHelpDialog open={true} onClose={onClose} />);

      // Radix Dialog の close button
      const closeButton = screen.getByRole("button");
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
