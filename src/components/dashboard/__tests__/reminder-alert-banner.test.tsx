import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { OverdueReminder } from "@/lib/actions/reminder-actions";

import { ReminderAlertBanner } from "../reminder-alert-banner";

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

  describe("表示件数上限と「もっと見る」機能", () => {
    const makeManyReminders = (count: number): OverdueReminder[] =>
      Array.from({ length: count }, (_, i) =>
        makeReminder({ memberId: `member-${i}`, memberName: `メンバー${i + 1}` }),
      );

    it("6件以上のリマインダーがある場合、初期表示は5件のみ", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(6)} />);
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(5);
    });

    it("5件以下のリマインダーは全件表示する", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(4)} />);
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(4);
    });

    it("6件以上のとき「もっと見る」ボタンが表示される", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(8)} />);
      expect(screen.getByRole("button", { name: /もっと見る/ })).toBeDefined();
    });

    it("5件以下のとき「もっと見る」ボタンは表示されない", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(5)} />);
      expect(screen.queryByRole("button", { name: /もっと見る/ })).toBeNull();
    });

    it("「もっと見る」ボタンに残り件数が表示される（例: +3件）", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(8)} />);
      expect(screen.getByRole("button", { name: /\+3件/ })).toBeDefined();
    });

    it("「もっと見る」ボタンをクリックすると全件表示される", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(8)} />);
      fireEvent.click(screen.getByRole("button", { name: /もっと見る/ }));
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(8);
    });

    it("展開後に「折りたたむ」ボタンが表示される", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(8)} />);
      fireEvent.click(screen.getByRole("button", { name: /もっと見る/ }));
      expect(screen.getByRole("button", { name: /折りたたむ/ })).toBeDefined();
    });

    it("「折りたたむ」ボタンをクリックすると5件に戻る", () => {
      render(<ReminderAlertBanner reminders={makeManyReminders(8)} />);
      fireEvent.click(screen.getByRole("button", { name: /もっと見る/ }));
      fireEvent.click(screen.getByRole("button", { name: /折りたたむ/ }));
      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(5);
    });
  });
});
