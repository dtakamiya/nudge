import { describe, expect, it } from "vitest";

import {
  calcNextRecommendedDate,
  formatNextRecommendedDate,
  isOverdue,
  isScheduledThisWeek,
} from "@/lib/schedule";

describe("calcNextRecommendedDate", () => {
  it("lastMeetingDate が null の場合は null を返す", () => {
    expect(calcNextRecommendedDate(null, 14)).toBeNull();
  });

  it("lastMeetingDate + intervalDays の日付を返す", () => {
    const last = new Date("2026-02-01");
    const result = calcNextRecommendedDate(last, 14);
    expect(result).not.toBeNull();
    expect(result!.toISOString().slice(0, 10)).toBe("2026-02-15");
  });

  it("intervalDays=7 の場合は1週間後を返す", () => {
    const last = new Date("2026-02-08");
    const result = calcNextRecommendedDate(last, 7);
    expect(result!.toISOString().slice(0, 10)).toBe("2026-02-15");
  });

  it("intervalDays=30 の場合は30日後を返す", () => {
    const last = new Date("2026-01-01");
    const result = calcNextRecommendedDate(last, 30);
    expect(result!.toISOString().slice(0, 10)).toBe("2026-01-31");
  });
});

describe("isOverdue", () => {
  it("lastMeetingDate が null の場合は true を返す（未実施）", () => {
    expect(isOverdue(null, 14)).toBe(true);
  });

  it("次回推奨日が now より前の場合は true を返す（超過）", () => {
    const last = new Date("2026-01-01");
    const now = new Date("2026-02-01"); // 31日経過、interval=14
    expect(isOverdue(last, 14, now)).toBe(true);
  });

  it("次回推奨日が now より後の場合は false を返す（期限内）", () => {
    const last = new Date("2026-02-20");
    const now = new Date("2026-02-22"); // 2日経過、interval=14
    expect(isOverdue(last, 14, now)).toBe(false);
  });

  it("次回推奨日が now と同日の場合は true を返す（当日 = 超過）", () => {
    const last = new Date("2026-02-08");
    const now = new Date("2026-02-22"); // 14日経過、interval=14
    // next = 2026-02-22, now = 2026-02-22 → overdue
    expect(isOverdue(last, 14, now)).toBe(true);
  });

  it("intervalDays=7 で8日経過の場合は true を返す", () => {
    const last = new Date("2026-02-14");
    const now = new Date("2026-02-22"); // 8日経過、interval=7
    expect(isOverdue(last, 7, now)).toBe(true);
  });

  it("intervalDays=30 で20日経過の場合は false を返す", () => {
    const last = new Date("2026-02-02");
    const now = new Date("2026-02-22"); // 20日経過、interval=30
    expect(isOverdue(last, 30, now)).toBe(false);
  });
});

describe("isScheduledThisWeek", () => {
  // now = 2026-02-22（日曜）として、今日から7日間（2/22〜2/28）を「今週」と定義
  const now = new Date("2026-02-22");

  it("lastMeetingDate が null の場合は false を返す", () => {
    expect(isScheduledThisWeek(null, 14, now)).toBe(false);
  });

  it("次回推奨日が今週内（今日）の場合は true を返す", () => {
    const last = new Date("2026-02-08"); // next = 2026-02-22 = 今日
    expect(isScheduledThisWeek(last, 14, now)).toBe(true);
  });

  it("次回推奨日が今週内（未来）の場合は true を返す", () => {
    const last = new Date("2026-02-14"); // next = 2026-02-28 = 今週末
    expect(isScheduledThisWeek(last, 14, now)).toBe(true);
  });

  it("次回推奨日が来週以降の場合は false を返す", () => {
    const last = new Date("2026-02-16"); // next = 2026-03-02 = 来週
    expect(isScheduledThisWeek(last, 14, now)).toBe(false);
  });

  it("次回推奨日が過去（超過）の場合は false を返す", () => {
    const last = new Date("2026-01-01"); // next = 2026-01-15 = 過去
    expect(isScheduledThisWeek(last, 14, now)).toBe(false);
  });
});

describe("formatNextRecommendedDate", () => {
  const now = new Date("2026-02-22");

  it("null の場合は「未設定」を返す", () => {
    expect(formatNextRecommendedDate(null, now)).toBe("未設定");
  });

  it("今日の場合は「今日」を返す", () => {
    const today = new Date("2026-02-22");
    expect(formatNextRecommendedDate(today, now)).toBe("今日");
  });

  it("過去の場合は「X日超過」を返す", () => {
    const past = new Date("2026-02-15"); // 7日前
    expect(formatNextRecommendedDate(past, now)).toBe("7日超過");
  });

  it("未来の場合は「あとX日」を返す", () => {
    const future = new Date("2026-02-25"); // 3日後
    expect(formatNextRecommendedDate(future, now)).toBe("あと3日");
  });

  it("明日の場合は「あと1日」を返す", () => {
    const tomorrow = new Date("2026-02-23");
    expect(formatNextRecommendedDate(tomorrow, now)).toBe("あと1日");
  });
});
