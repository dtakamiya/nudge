import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClosingDialog } from "../closing-dialog";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseSummaryProps = {
  date: "2026-02-23",
  conditionHealth: null,
  conditionMood: null,
  conditionWorkload: null,
  checkinNote: "",
  topicCount: 2,
  actionItemCount: 3,
};

describe("ClosingDialog", () => {
  describe("表示・非表示", () => {
    it("open=true でダイアログが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={baseSummaryProps}
        />,
      );
      expect(screen.getByText("ミーティングを保存しますか？")).toBeDefined();
    });

    it("open=false でダイアログが非表示になること", () => {
      render(
        <ClosingDialog
          open={false}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={baseSummaryProps}
        />,
      );
      expect(screen.queryByText("ミーティングを保存しますか？")).toBeNull();
    });
  });

  describe("アクションアイテムがある場合", () => {
    it("「保存する」ボタンが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={{ ...baseSummaryProps, actionItemCount: 2 }}
        />,
      );
      expect(screen.getByRole("button", { name: "保存する" })).toBeDefined();
    });

    it("「戻る」ボタンが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={{ ...baseSummaryProps, actionItemCount: 2 }}
        />,
      );
      expect(screen.getByRole("button", { name: "戻る" })).toBeDefined();
    });

    it("「保存する」ボタンクリックで onConfirm が呼ばれること", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
          summaryProps={{ ...baseSummaryProps, actionItemCount: 2 }}
        />,
      );
      await user.click(screen.getByRole("button", { name: "保存する" }));
      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("「戻る」ボタンクリックで onOpenChange(false) が呼ばれること", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <ClosingDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={vi.fn()}
          summaryProps={{ ...baseSummaryProps, actionItemCount: 2 }}
        />,
      );
      await user.click(screen.getByRole("button", { name: "戻る" }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("アクションアイテムが0件の場合", () => {
    const noActionProps = { ...baseSummaryProps, actionItemCount: 0 };

    it("警告テキストが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={noActionProps}
        />,
      );
      expect(
        screen.getByText(/アクションアイテムを設定すると次回の1on1がより効果的になります/),
      ).toBeDefined();
    });

    it("「アクションなしで保存」ボタンが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={noActionProps}
        />,
      );
      expect(screen.getByRole("button", { name: "アクションなしで保存" })).toBeDefined();
    });

    it("「戻って追加する」ボタンが表示されること", () => {
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          summaryProps={noActionProps}
        />,
      );
      expect(screen.getByRole("button", { name: "戻って追加する" })).toBeDefined();
    });

    it("「アクションなしで保存」ボタンクリックで onConfirm が呼ばれること", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <ClosingDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={onConfirm}
          summaryProps={noActionProps}
        />,
      );
      await user.click(screen.getByRole("button", { name: "アクションなしで保存" }));
      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("「戻って追加する」ボタンクリックで onOpenChange(false) が呼ばれること", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <ClosingDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={vi.fn()}
          summaryProps={noActionProps}
        />,
      );
      await user.click(screen.getByRole("button", { name: "戻って追加する" }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
