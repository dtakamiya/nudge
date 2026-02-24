export type GroupByType = "none" | "member" | "dueDate" | "tag";

export type ActionItemForGrouping = {
  id: string;
  dueDate: Date | null;
  member: { id: string; name: string };
  tags?: { id: string; name: string; color: string }[];
};

export type ActionGroup<T extends ActionItemForGrouping = ActionItemForGrouping> = {
  key: string;
  label: string;
  items: T[];
};

export function groupActionItems<T extends ActionItemForGrouping>(
  items: T[],
  groupBy: GroupByType,
  now: Date = new Date(),
): ActionGroup<T>[] {
  switch (groupBy) {
    case "member":
      return groupByMember(items);
    case "dueDate":
      return groupByDueDate(items, now);
    case "tag":
      return groupByTag(items);
    default:
      return [];
  }
}

function groupByMember<T extends ActionItemForGrouping>(items: T[]): ActionGroup<T>[] {
  const map = new Map<string, ActionGroup<T>>();
  for (const item of items) {
    const key = item.member.id;
    if (!map.has(key)) {
      map.set(key, { key, label: item.member.name, items: [] });
    }
    map.get(key)!.items.push(item);
  }
  return Array.from(map.values());
}

function groupByDueDate<T extends ActionItemForGrouping>(items: T[], now: Date): ActionGroup<T>[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(todayStart.getDate() + 1);

  // 今週の日曜日の次の日（月曜日）= 来週以降の境界
  const dayOfWeek = todayStart.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(todayStart);
  nextMonday.setDate(todayStart.getDate() + daysUntilNextMonday);

  const groups: ActionGroup<T>[] = [
    { key: "overdue", label: "期限超過", items: [] },
    { key: "today", label: "今日", items: [] },
    { key: "this-week", label: "今週", items: [] },
    { key: "later", label: "来週以降", items: [] },
    { key: "no-date", label: "期限なし", items: [] },
  ];

  for (const item of items) {
    if (!item.dueDate) {
      groups[4].items.push(item);
      continue;
    }
    const d = new Date(item.dueDate);
    const dueStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (dueStart < todayStart) {
      groups[0].items.push(item);
    } else if (dueStart < tomorrow) {
      groups[1].items.push(item);
    } else if (dueStart < nextMonday) {
      groups[2].items.push(item);
    } else {
      groups[3].items.push(item);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

function groupByTag<T extends ActionItemForGrouping>(items: T[]): ActionGroup<T>[] {
  const map = new Map<string, ActionGroup<T>>();
  const noTagItems: T[] = [];

  for (const item of items) {
    if (!item.tags || item.tags.length === 0) {
      noTagItems.push(item);
      continue;
    }
    for (const tag of item.tags) {
      if (!map.has(tag.id)) {
        map.set(tag.id, { key: tag.id, label: tag.name, items: [] });
      }
      map.get(tag.id)!.items.push(item);
    }
  }

  const groups = Array.from(map.values());
  if (noTagItems.length > 0) {
    groups.push({ key: "no-tag", label: "タグなし", items: noTagItems });
  }
  return groups;
}
