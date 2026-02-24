import { describe, expect, it } from "vitest";

import { generateIcalContent } from "@/lib/ical";

describe("generateIcalContent", () => {
  const memberName = "田中 太郎";
  const nextDate = new Date("2026-03-15T00:00:00.000Z");

  it("BEGIN:VCALENDAR と END:VCALENDAR を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("BEGIN:VCALENDAR");
    expect(result).toContain("END:VCALENDAR");
  });

  it("VERSION:2.0 を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("VERSION:2.0");
  });

  it("BEGIN:VEVENT と END:VEVENT を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("BEGIN:VEVENT");
    expect(result).toContain("END:VEVENT");
  });

  it("メンバー名を含む SUMMARY を生成する", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("SUMMARY:1on1 - 田中 太郎");
  });

  it("次回予定日を DTSTART に含む（YYYYMMDD 形式）", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("DTSTART;VALUE=DATE:20260315");
  });

  it("DURATION:PT30M を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("DURATION:PT30M");
  });

  it("DESCRIPTION を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("DESCRIPTION:");
  });

  it("CRLF 改行を使用する", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("\r\n");
  });

  it("PRODID を含む", () => {
    const result = generateIcalContent(memberName, nextDate);
    expect(result).toContain("PRODID:");
  });

  it("日付が別の日付でも正しく出力される", () => {
    const anotherDate = new Date("2026-12-01T00:00:00.000Z");
    const result = generateIcalContent("佐藤 花子", anotherDate);
    expect(result).toContain("DTSTART;VALUE=DATE:20261201");
    expect(result).toContain("SUMMARY:1on1 - 佐藤 花子");
  });
});
