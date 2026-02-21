import { describe, it, expect } from "vitest";
import { screenReaderInstructions, createAnnouncements } from "../dnd-accessibility";

describe("dnd-accessibility", () => {
  describe("screenReaderInstructions", () => {
    it("draggable の説明にスペースキーの操作方法が含まれる", () => {
      expect(screenReaderInstructions.draggable).toContain("スペースキー");
    });

    it("draggable の説明に矢印キーの操作方法が含まれる", () => {
      expect(screenReaderInstructions.draggable).toContain("矢印キー");
    });

    it("draggable の説明にエスケープキーのキャンセル方法が含まれる", () => {
      expect(screenReaderInstructions.draggable).toContain("エスケープキー");
    });
  });

  describe("createAnnouncements", () => {
    const announcements = createAnnouncements("話題");

    it("onDragStart でアイテムを掴んだことを通知する", () => {
      const result = announcements.onDragStart!({
        active: { id: "topic-0" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toContain("話題");
      expect(result).toContain("掴みました");
    });

    it("onDragOver でドロップ先がある場合に移動中を通知する", () => {
      const result = announcements.onDragOver!({
        active: { id: "topic-0" },
        over: { id: "topic-1" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toContain("移動中");
    });

    it("onDragOver でドロップ先がない場合に通知する", () => {
      const result = announcements.onDragOver!({
        active: { id: "topic-0" },
        over: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toContain("外");
    });

    it("onDragEnd でドロップ先がある場合に配置を通知する", () => {
      const result = announcements.onDragEnd!({
        active: { id: "topic-0" },
        over: { id: "topic-1" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toContain("配置しました");
    });

    it("onDragEnd でドロップ先がない場合に通知する", () => {
      const result = announcements.onDragEnd!({
        active: { id: "topic-0" },
        over: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toBeDefined();
    });

    it("onDragCancel でキャンセルを通知する", () => {
      const result = announcements.onDragCancel!({
        active: { id: "topic-0" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      expect(result).toContain("キャンセル");
    });
  });
});
