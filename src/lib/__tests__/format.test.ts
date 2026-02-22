import { describe, expect,it } from "vitest";

import { formatDaysElapsed,formatRelativeDate } from "@/lib/format";

describe("formatRelativeDate", () => {
  it("returns '未実施' for null", () => {
    expect(formatRelativeDate(null)).toBe("未実施");
  });

  it("returns '今日' for today", () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe("今日");
  });

  it("returns '1日前' for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe("1日前");
  });

  it("returns '7日前' for 7 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    expect(formatRelativeDate(date)).toBe("7日前");
  });

  it("returns '2週間前' for 14 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    expect(formatRelativeDate(date)).toBe("2週間前");
  });

  it("returns '3週間前' for 21 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 21);
    expect(formatRelativeDate(date)).toBe("3週間前");
  });

  it("returns '1ヶ月以上前' for 35 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 35);
    expect(formatRelativeDate(date)).toBe("1ヶ月以上前");
  });

  it("accepts string dates", () => {
    const today = new Date().toISOString();
    expect(formatRelativeDate(today)).toBe("今日");
  });
});

describe("formatDaysElapsed", () => {
  it("returns '未実施' for null", () => {
    expect(formatDaysElapsed(null)).toBe("未実施");
  });

  it("returns '今日' for today", () => {
    const today = new Date();
    expect(formatDaysElapsed(today)).toBe("今日");
  });

  it("returns '1日経過' for yesterday", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    expect(formatDaysElapsed(date)).toBe("1日経過");
  });

  it("returns '7日経過' for 7 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    expect(formatDaysElapsed(date)).toBe("7日経過");
  });

  it("returns '13日経過' for 13 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 13);
    expect(formatDaysElapsed(date)).toBe("13日経過");
  });

  it("returns '2週間経過' for 14 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    expect(formatDaysElapsed(date)).toBe("2週間経過");
  });

  it("returns '4週間経過' for 28 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 28);
    expect(formatDaysElapsed(date)).toBe("4週間経過");
  });

  it("returns '1ヶ月以上経過' for 31 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 31);
    expect(formatDaysElapsed(date)).toBe("1ヶ月以上経過");
  });

  it("accepts string dates", () => {
    const today = new Date().toISOString();
    expect(formatDaysElapsed(today)).toBe("今日");
  });
});
