import { cleanup,render, screen } from "@testing-library/react";
import { afterEach,describe, expect, it } from "vitest";

import type { ActionItemWithMember } from "@/lib/actions/dashboard-actions";

import { UpcomingActionsSection } from "../upcoming-actions-section";

afterEach(() => {
  cleanup();
});

const makeAction = (overrides: Partial<ActionItemWithMember> = {}): ActionItemWithMember => ({
  id: "action-1",
  title: "テストタスク",
  memberId: "member-1",
  memberName: "田中太郎",
  dueDate: new Date("2026-02-22"),
  status: "TODO",
  ...overrides,
});

describe("UpcomingActionsSection", () => {
  it("今日も今週も空の場合にメッセージを表示する", () => {
    render(<UpcomingActionsSection today={[]} thisWeek={[]} />);
    expect(screen.getByText("今週の期限アクションはありません")).toBeDefined();
  });

  it("今日期限のアイテムを表示する", () => {
    const todayAction = makeAction({ title: "今日締め切りタスク" });
    render(<UpcomingActionsSection today={[todayAction]} thisWeek={[]} />);
    expect(screen.getByText("今日期限")).toBeDefined();
    expect(screen.getByText("今日締め切りタスク")).toBeDefined();
    expect(screen.getByText("田中太郎")).toBeDefined();
  });

  it("今週期限のアイテムを表示する", () => {
    const weekAction = makeAction({ id: "action-2", title: "今週締め切りタスク" });
    render(<UpcomingActionsSection today={[]} thisWeek={[weekAction]} />);
    expect(screen.getByText("今週期限")).toBeDefined();
    expect(screen.getByText("今週締め切りタスク")).toBeDefined();
  });

  it("今日と今週の両セクションを表示する", () => {
    const todayAction = makeAction({ title: "今日タスク" });
    const weekAction = makeAction({ id: "action-2", title: "今週タスク" });
    render(<UpcomingActionsSection today={[todayAction]} thisWeek={[weekAction]} />);
    expect(screen.getByText("今日期限")).toBeDefined();
    expect(screen.getByText("今週期限")).toBeDefined();
    expect(screen.getByText("今日タスク")).toBeDefined();
    expect(screen.getByText("今週タスク")).toBeDefined();
  });

  it("今日期限のバッジに件数を表示する", () => {
    const actions = [
      makeAction({ id: "a1", title: "タスク1" }),
      makeAction({ id: "a2", title: "タスク2" }),
    ];
    render(<UpcomingActionsSection today={actions} thisWeek={[]} />);
    expect(screen.getByText("2")).toBeDefined();
  });

  it("メンバー詳細へのリンクが正しい", () => {
    const action = makeAction({ memberId: "member-42" });
    render(<UpcomingActionsSection today={[action]} thisWeek={[]} />);
    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toBe("/members/member-42");
  });
});
