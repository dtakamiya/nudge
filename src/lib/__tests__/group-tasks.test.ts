import { describe, expect, it } from "vitest";

import type { TaskItemForGrouping } from "@/lib/group-tasks";
import { groupTasksByDueDate, groupTasksByMember } from "@/lib/group-tasks";

function makeItem(overrides: Partial<TaskItemForGrouping> = {}): TaskItemForGrouping {
  return {
    id: "item-1",
    title: "テストアイテム",
    status: "TODO",
    dueDate: null,
    member: { id: "member-1", name: "田中太郎" },
    meeting: { id: "meeting-1", date: new Date("2026-02-01") },
    tags: [],
    ...overrides,
  };
}

describe("groupTasksByDueDate", () => {
  const now = new Date("2026-02-24T12:00:00");

  it("期限なしアイテムは「期限なし」グループに入る", () => {
    const items = [makeItem({ dueDate: null })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("no-date");
    expect(groups[0].label).toBe("期限なし");
    expect(groups[0].isOverdue).toBe(false);
  });

  it("期限超過アイテムは「期限超過」グループに入り isOverdue が true", () => {
    const items = [makeItem({ dueDate: new Date("2026-02-20") })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("overdue");
    expect(groups[0].isOverdue).toBe(true);
  });

  it("今日期限のアイテムは「今日」グループに入る", () => {
    const items = [makeItem({ dueDate: new Date("2026-02-24") })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("today");
  });

  it("今週期限のアイテムは「今週」グループに入る", () => {
    const items = [makeItem({ dueDate: new Date("2026-02-26") })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("this-week");
  });

  it("来週以降のアイテムは「来週以降」グループに入る", () => {
    const items = [makeItem({ dueDate: new Date("2026-03-10") })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("later");
  });

  it("アイテムがない場合は空配列を返す", () => {
    const groups = groupTasksByDueDate([], now);
    expect(groups).toHaveLength(0);
  });

  it("空のグループは返さない", () => {
    const items = [makeItem({ dueDate: new Date("2026-02-20") })];
    const groups = groupTasksByDueDate(items, now);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });

  it("複数のグループに振り分けられる", () => {
    const items = [
      makeItem({ id: "1", dueDate: new Date("2026-02-20") }), // overdue
      makeItem({ id: "2", dueDate: new Date("2026-02-24") }), // today
      makeItem({ id: "3", dueDate: null }), // no-date
    ];
    const groups = groupTasksByDueDate(items, now);
    expect(groups).toHaveLength(3);
    expect(groups[0].key).toBe("overdue");
    expect(groups[1].key).toBe("today");
    expect(groups[2].key).toBe("no-date");
  });
});

describe("groupTasksByMember", () => {
  it("同一メンバーのアイテムがグループ化される", () => {
    const items = [
      makeItem({ id: "1", member: { id: "m1", name: "田中" } }),
      makeItem({ id: "2", member: { id: "m1", name: "田中" } }),
    ];
    const groups = groupTasksByMember(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].memberId).toBe("m1");
    expect(groups[0].items).toHaveLength(2);
  });

  it("異なるメンバーのアイテムが別々のグループになる", () => {
    const items = [
      makeItem({ id: "1", member: { id: "m1", name: "田中" } }),
      makeItem({ id: "2", member: { id: "m2", name: "佐藤" } }),
    ];
    const groups = groupTasksByMember(items);
    expect(groups).toHaveLength(2);
  });

  it("空配列を渡すと空配列を返す", () => {
    const groups = groupTasksByMember([]);
    expect(groups).toHaveLength(0);
  });
});
