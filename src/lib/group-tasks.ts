import type { ActionItemStatusType } from "@/lib/validations/action-item";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export type TaskItemForGrouping = {
  id: string;
  title: string;
  status: ActionItemStatusType;
  dueDate: Date | null;
  member: { id: string; name: string };
  meeting: { id: string; date: Date };
  tags: Tag[];
};

export type TaskDateGroup = {
  key: string;
  label: string;
  items: TaskItemForGrouping[];
  isOverdue: boolean;
};

export function groupTasksByDueDate(
  items: TaskItemForGrouping[],
  now: Date = new Date(),
): TaskDateGroup[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 1,
  );

  const dayOfWeek = todayStart.getDay();
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + daysUntilNextMonday,
  );

  const groups: TaskDateGroup[] = [
    { key: "overdue", label: "期限超過", items: [], isOverdue: true },
    { key: "today", label: "今日", items: [], isOverdue: false },
    { key: "this-week", label: "今週", items: [], isOverdue: false },
    { key: "later", label: "来週以降", items: [], isOverdue: false },
    { key: "no-date", label: "期限なし", items: [], isOverdue: false },
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

export type MemberGroup = {
  memberId: string;
  memberName: string;
  items: TaskItemForGrouping[];
};

export function groupTasksByMember(items: TaskItemForGrouping[]): MemberGroup[] {
  const map = new Map<string, MemberGroup>();
  for (const item of items) {
    const key = item.member.id;
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, items: [...existing.items, item] });
    } else {
      map.set(key, { memberId: key, memberName: item.member.name, items: [item] });
    }
  }
  return Array.from(map.values());
}
