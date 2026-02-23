import { describe, expect, it } from "vitest";

import { getDueDateStatus } from "@/lib/due-date";

describe("getDueDateStatus", () => {
  const today = new Date("2026-02-23T12:00:00");

  it("dueDate が null の場合 'none' を返す", () => {
    expect(getDueDateStatus(null, "TODO", today)).toBe("none");
  });

  it("status が DONE の場合は 'normal' を返す（期限切れでも）", () => {
    const pastDate = new Date("2026-01-01");
    expect(getDueDateStatus(pastDate, "DONE", today)).toBe("normal");
  });

  it("dueDate が今日より前（期限超過）の場合 'overdue' を返す", () => {
    const yesterday = new Date("2026-02-22");
    expect(getDueDateStatus(yesterday, "TODO", today)).toBe("overdue");
  });

  it("dueDate が今日の場合 'due-soon' を返す", () => {
    const todayDate = new Date("2026-02-23");
    expect(getDueDateStatus(todayDate, "TODO", today)).toBe("due-soon");
  });

  it("dueDate が3日以内の場合 'due-soon' を返す", () => {
    const threeDaysLater = new Date("2026-02-26");
    expect(getDueDateStatus(threeDaysLater, "TODO", today)).toBe("due-soon");
  });

  it("dueDate が4日以降の場合 'normal' を返す", () => {
    const fourDaysLater = new Date("2026-02-27");
    expect(getDueDateStatus(fourDaysLater, "TODO", today)).toBe("normal");
  });

  it("status が IN_PROGRESS でも期限超過は 'overdue' を返す", () => {
    const pastDate = new Date("2026-01-01");
    expect(getDueDateStatus(pastDate, "IN_PROGRESS", today)).toBe("overdue");
  });

  it("today パラメータを省略した場合も動作する（実際の今日を使用）", () => {
    const farFuture = new Date("2099-12-31");
    expect(getDueDateStatus(farFuture, "TODO")).toBe("normal");
  });
});
