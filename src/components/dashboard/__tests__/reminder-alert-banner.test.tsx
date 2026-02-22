import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ReminderAlertBanner } from "../reminder-alert-banner";
import type { OverdueReminder } from "@/lib/actions/reminder-actions";

afterEach(() => {
  cleanup();
});

const makeReminder = (overrides: Partial<OverdueReminder> = {}): OverdueReminder => ({
  memberId: "member-1",
  memberName: "テストメンバー",
  meetingIntervalDays: 14,
  daysSinceLastMeeting: 20,
  ...overrides,
});

describe("ReminderAlertBanner", () => {
  it("リマインダーが空の場合は何も表示しない", () => {
    const { container } = render(<ReminderAlertBanner reminders={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("リマインダーがある場合はバナーを表示する", () => {
    render(<ReminderAlertBanner reminders={[makeReminder()]} />);
    expect(screen.getByText(/ミーティングリマインダー/)).toBeDefined();
  });

  it("期限超過メンバー名を表示する", () => {
    render(
      <ReminderAlertBanner
        reminders={[makeReminder({ memberName: "田中太郎", daysSinceLastMeeting: 15 })]}
      />,
    );
    expect(screen.getByText("田中太郎")).toBeDefined();
  });

  it("経過日数を表示する", () => {
    render(
      <ReminderAlertBanner
        reminders={[makeReminder({ daysSinceLastMeeting: 20, meetingIntervalDays: 14 })]}
      />,
    );
    expect(screen.getByText(/20日経過/)).toBeDefined();
  });

  it("未ミーティングメンバーは「未実施」と表示する", () => {
    render(<ReminderAlertBanner reminders={[makeReminder({ daysSinceLastMeeting: null })]} />);
    expect(screen.getByText(/未実施/)).toBeDefined();
  });

  it("複数のリマインダーを表示する", () => {
    const reminders = [
      makeReminder({ memberName: "田中太郎", memberId: "1" }),
      makeReminder({ memberName: "鈴木花子", memberId: "2" }),
    ];
    render(<ReminderAlertBanner reminders={reminders} />);
    expect(screen.getByText("田中太郎")).toBeDefined();
    expect(screen.getByText("鈴木花子")).toBeDefined();
  });

  it("「1on1準備」リンクが各メンバーに表示される", () => {
    render(<ReminderAlertBanner reminders={[makeReminder({ memberId: "member-abc" })]} />);
    const link = screen.getByRole("link", { name: /1on1準備/ });
    expect(link).toBeDefined();
    expect((link as HTMLAnchorElement).href).toContain("/members/member-abc");
  });

  it("リマインダーが3件以上の場合、件数バッジを表示する", () => {
    const reminders = Array.from({ length: 3 }, (_, i) =>
      makeReminder({ memberId: `member-${i}`, memberName: `メンバー${i + 1}` }),
    );
    render(<ReminderAlertBanner reminders={reminders} />);
    expect(screen.getByText(/3件/)).toBeDefined();
  });
});
