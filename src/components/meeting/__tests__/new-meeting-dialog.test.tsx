import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewMeetingDialog } from "../new-meeting-dialog";

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

describe("NewMeetingDialog", () => {
  describe("表示", () => {
    it("open=true のときメンバー選択ダイアログが表示される", () => {
      render(<NewMeetingDialog open={true} onClose={() => {}} members={members} />);

      expect(screen.getByText("新規ミーティングを作成")).toBeDefined();
    });

    it("open=false のとき内容が表示されない", () => {
      render(<NewMeetingDialog open={false} onClose={() => {}} members={members} />);

      expect(screen.queryByText("新規ミーティングを作成")).toBeNull();
    });

    it("メンバーが選択肢に表示される", () => {
      render(<NewMeetingDialog open={true} onClose={() => {}} members={members} />);

      // select の option を直接確認
      const options = screen.getAllByRole("option");
      const names = options.map((o) => o.textContent);
      expect(names).toContain("田中太郎");
      expect(names).toContain("鈴木花子");
    });

    it("メンバーが 0 人の場合は空状態メッセージを表示する", () => {
      render(<NewMeetingDialog open={true} onClose={() => {}} members={[]} />);

      expect(screen.getByText("メンバーがいません")).toBeDefined();
    });
  });

  describe("ナビゲーション", () => {
    it("メンバーを選択して作成ボタンを押すと正しいURLに遷移する", async () => {
      const user = userEvent.setup();
      render(<NewMeetingDialog open={true} onClose={() => {}} members={members} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "m1");

      const createButton = screen.getByRole("button", { name: "作成" });
      await user.click(createButton);

      expect(mockPush).toHaveBeenCalledWith("/members/m1/meetings/new");
    });
  });

  describe("クローズ動作", () => {
    it("キャンセルボタンで onClose が呼ばれる", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<NewMeetingDialog open={true} onClose={onClose} members={members} />);

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
