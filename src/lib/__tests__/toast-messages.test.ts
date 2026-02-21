import { describe, it, expect } from "vitest";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

describe("TOAST_MESSAGES", () => {
  describe("member", () => {
    it("メンバー操作のメッセージが定義されている", () => {
      expect(TOAST_MESSAGES.member.createSuccess).toBe("メンバーを登録しました");
      expect(TOAST_MESSAGES.member.createError).toBe("メンバーの登録に失敗しました");
      expect(TOAST_MESSAGES.member.updateSuccess).toBe("メンバー情報を更新しました");
      expect(TOAST_MESSAGES.member.updateError).toBe("メンバー情報の更新に失敗しました");
      expect(TOAST_MESSAGES.member.deleteSuccess).toBe("メンバーを削除しました");
      expect(TOAST_MESSAGES.member.deleteError).toBe("メンバーの削除に失敗しました");
    });
  });

  describe("meeting", () => {
    it("ミーティング操作のメッセージが定義されている", () => {
      expect(TOAST_MESSAGES.meeting.createSuccess).toBe("1on1を保存しました");
      expect(TOAST_MESSAGES.meeting.createError).toBe("1on1の保存に失敗しました");
      expect(TOAST_MESSAGES.meeting.updateSuccess).toBe("1on1を更新しました");
      expect(TOAST_MESSAGES.meeting.updateError).toBe("1on1の更新に失敗しました");
      expect(TOAST_MESSAGES.meeting.deleteSuccess).toBe("ミーティングを削除しました");
      expect(TOAST_MESSAGES.meeting.deleteError).toBe("ミーティングの削除に失敗しました");
    });
  });

  describe("actionItem", () => {
    it("アクションアイテム操作のメッセージが定義されている", () => {
      expect(TOAST_MESSAGES.actionItem.statusChangeSuccess).toBe("ステータスを更新しました");
      expect(TOAST_MESSAGES.actionItem.statusChangeError).toBe("ステータスの更新に失敗しました");
    });
  });
});
