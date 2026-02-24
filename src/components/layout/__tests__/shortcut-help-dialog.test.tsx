import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShortcutHelpDialog } from "../shortcut-help-dialog";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ShortcutHelpDialog", () => {
  describe("表示", () => {
    it("open=true のときグローバルショートカットが表示される", () => {
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

    it("context 未指定のとき記録中セクションも表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} />);

      expect(screen.getByText("記録中")).toBeDefined();
      expect(screen.getByText("タイマー開始/一時停止")).toBeDefined();
      expect(screen.getByText("新しいトピックを追加")).toBeDefined();
      expect(screen.getByText("アクションアイテムを追加")).toBeDefined();
    });

    it("context='global' のとき記録中セクションは表示されない", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} context="global" />);

      expect(screen.queryByText("記録中")).toBeNull();
      expect(screen.queryByText("タイマー開始/一時停止")).toBeNull();
    });

    it("context='recording' のとき記録中セクションが表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} context="recording" />);

      expect(screen.getByText("記録中")).toBeDefined();
      expect(screen.getByText("タイマー開始/一時停止")).toBeDefined();
    });

    it("グローバルセクションラベルが表示される", () => {
      render(<ShortcutHelpDialog open={true} onClose={() => {}} />);

      expect(screen.getByText("グローバル")).toBeDefined();
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
