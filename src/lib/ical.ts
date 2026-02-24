/**
 * iCalendar (.ics) ファイル生成ユーティリティ
 * RFC 5545 準拠
 */

/**
 * 日付を iCalendar の DATE 形式（YYYYMMDD）に変換する
 */
function formatIcalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * 次回1on1の予定をiCalendarコンテンツとして生成する
 * @param memberName メンバー名
 * @param nextDate 次回予定日
 * @returns iCalendar形式の文字列（CRLF改行）
 */
export function generateIcalContent(memberName: string, nextDate: Date): string {
  const dtstart = formatIcalDate(nextDate);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nudge//1on1 Calendar//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:1on1 - ${memberName}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    "DURATION:PT30M",
    "DESCRIPTION:Nudgeで記録した1on1ミーティング",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n") + "\r\n";
}
