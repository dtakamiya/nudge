export type DueDateStatus = "overdue" | "due-soon" | "normal" | "none";

export function getDueDateStatus(
  dueDate: Date | null,
  status: string,
  today: Date = new Date(),
): DueDateStatus {
  if (!dueDate) return "none";
  if (status === "DONE") return "normal";

  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  const dueMidnight = new Date(dueDate);
  dueMidnight.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";
  return "normal";
}
