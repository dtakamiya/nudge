import { describe, expect, it } from "vitest";

import type { ActionItemForGrouping } from "../group-actions";
import { groupActionItems } from "../group-actions";

function makeItem(
  overrides: Partial<ActionItemForGrouping> & { id: string },
): ActionItemForGrouping {
  return {
    id: overrides.id,
    dueDate: overrides.dueDate ?? null,
    member: overrides.member ?? { id: "m1", name: "田中太郎" },
    tags: overrides.tags ?? [],
  };
}

// 固定の「今日」: 2024-06-12 (水曜日, getDay()=3)
const TODAY = new Date(2024, 5, 12); // 2024-06-12

describe("groupActionItems", () => {
  describe("groupBy: none", () => {
    it("空配列を返す", () => {
      const items = [makeItem({ id: "1" })];
      expect(groupActionItems(items, "none")).toEqual([]);
    });
  });

  describe("groupBy: member", () => {
    it("メンバーIDでグループ化する", () => {
      const items = [
        makeItem({ id: "1", member: { id: "m1", name: "田中太郎" } }),
        makeItem({ id: "2", member: { id: "m2", name: "佐藤花子" } }),
        makeItem({ id: "3", member: { id: "m1", name: "田中太郎" } }),
      ];
      const groups = groupActionItems(items, "member");
      expect(groups).toHaveLength(2);
      expect(groups[0].key).toBe("m1");
      expect(groups[0].label).toBe("田中太郎");
      expect(groups[0].items).toHaveLength(2);
      expect(groups[1].key).toBe("m2");
      expect(groups[1].label).toBe("佐藤花子");
      expect(groups[1].items).toHaveLength(1);
    });

    it("アイテムが1件のメンバーもグループを作成する", () => {
      const items = [makeItem({ id: "1", member: { id: "m1", name: "田中太郎" } })];
      const groups = groupActionItems(items, "member");
      expect(groups).toHaveLength(1);
      expect(groups[0].items).toHaveLength(1);
    });

    it("空のアイテムリストで空配列を返す", () => {
      expect(groupActionItems([], "member")).toEqual([]);
    });

    it("グループ内でアイテムの順序を保持する", () => {
      const items = [
        makeItem({ id: "1", member: { id: "m1", name: "田中" } }),
        makeItem({ id: "2", member: { id: "m1", name: "田中" } }),
      ];
      const groups = groupActionItems(items, "member");
      expect(groups[0].items[0].id).toBe("1");
      expect(groups[0].items[1].id).toBe("2");
    });
  });

  describe("groupBy: dueDate", () => {
    it("期限なしアイテムを '期限なし' グループに入れる", () => {
      const items = [makeItem({ id: "1", dueDate: null })];
      const groups = groupActionItems(items, "dueDate", TODAY);
      expect(groups).toHaveLength(1);
      expect(groups[0].key).toBe("no-date");
      expect(groups[0].label).toBe("期限なし");
    });

    it("今日期限のアイテムを '今日' グループに入れる", () => {
      const items = [makeItem({ id: "1", dueDate: new Date(2024, 5, 12) })];
      const groups = groupActionItems(items, "dueDate", TODAY);
      const todayGroup = groups.find((g) => g.key === "today");
      expect(todayGroup).toBeDefined();
      expect(todayGroup!.items).toHaveLength(1);
    });

    it("今日より前のアイテムを '期限超過' グループに入れる", () => {
      const items = [makeItem({ id: "1", dueDate: new Date(2024, 5, 11) })];
      const groups = groupActionItems(items, "dueDate", TODAY);
      const overdueGroup = groups.find((g) => g.key === "overdue");
      expect(overdueGroup).toBeDefined();
      expect(overdueGroup!.items).toHaveLength(1);
      expect(overdueGroup!.label).toBe("期限超過");
    });

    it("今週のアイテムを '今週' グループに入れる（今日の翌日～日曜）", () => {
      // TODAY = 2024-06-12 (水曜)。今週 = 2024-06-13 (木) ~ 2024-06-16 (日)
      const items = [
        makeItem({ id: "1", dueDate: new Date(2024, 5, 13) }), // 木曜
        makeItem({ id: "2", dueDate: new Date(2024, 5, 16) }), // 日曜
      ];
      const groups = groupActionItems(items, "dueDate", TODAY);
      const thisWeekGroup = groups.find((g) => g.key === "this-week");
      expect(thisWeekGroup).toBeDefined();
      expect(thisWeekGroup!.items).toHaveLength(2);
      expect(thisWeekGroup!.label).toBe("今週");
    });

    it("来週以降のアイテムを '来週以降' グループに入れる", () => {
      // TODAY = 2024-06-12 (水曜)。来週以降 = 2024-06-17 (月) 以降
      const items = [
        makeItem({ id: "1", dueDate: new Date(2024, 5, 17) }), // 来週月曜
        makeItem({ id: "2", dueDate: new Date(2024, 6, 1) }), // 来月
      ];
      const groups = groupActionItems(items, "dueDate", TODAY);
      const laterGroup = groups.find((g) => g.key === "later");
      expect(laterGroup).toBeDefined();
      expect(laterGroup!.items).toHaveLength(2);
      expect(laterGroup!.label).toBe("来週以降");
    });

    it("アイテムがないグループは除外する", () => {
      const items = [makeItem({ id: "1", dueDate: null })];
      const groups = groupActionItems(items, "dueDate", TODAY);
      expect(groups.every((g) => g.items.length > 0)).toBe(true);
      // 期限なしのみ
      expect(groups).toHaveLength(1);
    });

    it("グループの表示順序: 期限超過 → 今日 → 今週 → 来週以降 → 期限なし", () => {
      const items = [
        makeItem({ id: "1", dueDate: null }),
        makeItem({ id: "2", dueDate: new Date(2024, 5, 17) }), // 来週以降
        makeItem({ id: "3", dueDate: new Date(2024, 5, 12) }), // 今日
        makeItem({ id: "4", dueDate: new Date(2024, 5, 11) }), // 期限超過
        makeItem({ id: "5", dueDate: new Date(2024, 5, 13) }), // 今週
      ];
      const groups = groupActionItems(items, "dueDate", TODAY);
      expect(groups.map((g) => g.key)).toEqual([
        "overdue",
        "today",
        "this-week",
        "later",
        "no-date",
      ]);
    });

    it("今日が日曜日のとき今週グループが空になる", () => {
      // 2024-06-16 が日曜日
      const sunday = new Date(2024, 5, 16);
      const items = [
        makeItem({ id: "1", dueDate: new Date(2024, 5, 16) }), // 今日（日曜）
        makeItem({ id: "2", dueDate: new Date(2024, 5, 23) }), // 来週以降
      ];
      const groups = groupActionItems(items, "dueDate", sunday);
      const keys = groups.map((g) => g.key);
      expect(keys).not.toContain("this-week");
      expect(keys).toContain("today");
      expect(keys).toContain("later");
    });
  });

  describe("groupBy: tag", () => {
    it("タグIDでグループ化する", () => {
      const items = [
        makeItem({
          id: "1",
          tags: [{ id: "t1", name: "バグ", color: "#ff0000" }],
        }),
        makeItem({
          id: "2",
          tags: [{ id: "t2", name: "機能", color: "#00ff00" }],
        }),
        makeItem({
          id: "3",
          tags: [{ id: "t1", name: "バグ", color: "#ff0000" }],
        }),
      ];
      const groups = groupActionItems(items, "tag");
      expect(groups.length).toBeGreaterThanOrEqual(2);
      const bugGroup = groups.find((g) => g.key === "t1");
      expect(bugGroup).toBeDefined();
      expect(bugGroup!.label).toBe("バグ");
      expect(bugGroup!.items).toHaveLength(2);
    });

    it("タグなしアイテムを 'タグなし' グループに入れる", () => {
      const items = [makeItem({ id: "1", tags: [] }), makeItem({ id: "2", tags: undefined })];
      const groups = groupActionItems(items, "tag");
      const noTagGroup = groups.find((g) => g.key === "no-tag");
      expect(noTagGroup).toBeDefined();
      expect(noTagGroup!.label).toBe("タグなし");
      expect(noTagGroup!.items).toHaveLength(2);
    });

    it("複数タグを持つアイテムは各タグのグループに表示される", () => {
      const items = [
        makeItem({
          id: "1",
          tags: [
            { id: "t1", name: "バグ", color: "#ff0000" },
            { id: "t2", name: "機能", color: "#00ff00" },
          ],
        }),
      ];
      const groups = groupActionItems(items, "tag");
      expect(groups.length).toBe(2);
      expect(groups.find((g) => g.key === "t1")!.items).toHaveLength(1);
      expect(groups.find((g) => g.key === "t2")!.items).toHaveLength(1);
    });

    it("'タグなし' グループはリストの最後に表示される", () => {
      const items = [
        makeItem({ id: "1", tags: [{ id: "t1", name: "バグ", color: "#f00" }] }),
        makeItem({ id: "2", tags: [] }),
      ];
      const groups = groupActionItems(items, "tag");
      expect(groups[groups.length - 1].key).toBe("no-tag");
    });

    it("空のアイテムリストで空配列を返す", () => {
      expect(groupActionItems([], "tag")).toEqual([]);
    });
  });
});
