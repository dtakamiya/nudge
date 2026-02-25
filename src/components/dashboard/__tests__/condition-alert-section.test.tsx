import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ConditionAlertMember } from "@/lib/types";

import { ConditionAlertSection } from "../condition-alert-section";

afterEach(() => {
  cleanup();
});

const makeMember = (overrides: Partial<ConditionAlertMember> = {}): ConditionAlertMember => ({
  memberId: "member-1",
  memberName: "テストメンバー",
  alerts: [
    {
      type: "mood",
      label: "気分",
      values: [2, 3, 4],
      trend: "declining",
    },
  ],
  ...overrides,
});

describe("ConditionAlertSection", () => {
  it("アラート対象が空の場合は何も表示しない", () => {
    const { container } = render(<ConditionAlertSection members={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("アラートがある場合はセクションを表示する", () => {
    render(<ConditionAlertSection members={[makeMember()]} />);
    expect(screen.getByText(/要注目メンバー/)).toBeDefined();
  });

  it("件数バッジを表示する", () => {
    const members = [
      makeMember({ memberId: "m1", memberName: "田中太郎" }),
      makeMember({ memberId: "m2", memberName: "鈴木花子" }),
    ];
    render(<ConditionAlertSection members={members} />);
    expect(screen.getByText(/2人/)).toBeDefined();
  });

  it("メンバー名を表示する", () => {
    render(<ConditionAlertSection members={[makeMember({ memberName: "山田一郎" })]} />);
    expect(screen.getByText("山田一郎")).toBeDefined();
  });

  it("メンバー名がメンバー詳細へのリンクになっている", () => {
    render(<ConditionAlertSection members={[makeMember({ memberId: "abc-123" })]} />);
    const link = screen.getByRole("link", { name: "テストメンバー" });
    expect((link as HTMLAnchorElement).getAttribute("href")).toContain("/members/abc-123");
  });

  it("低下傾向のアラートラベルを表示する", () => {
    render(
      <ConditionAlertSection
        members={[
          makeMember({
            alerts: [{ type: "mood", label: "気分", values: [3, 4], trend: "declining" }],
          }),
        ]}
      />,
    );
    expect(screen.getByText(/気分/)).toBeDefined();
    expect(screen.getByText(/低下傾向/)).toBeDefined();
  });

  it("低値のアラートラベルを表示する", () => {
    render(
      <ConditionAlertSection
        members={[
          makeMember({
            alerts: [{ type: "mood", label: "気分", values: [1, 3], trend: "low" }],
          }),
        ]}
      />,
    );
    expect(screen.getByText(/気分/)).toBeDefined();
    expect(screen.getByText(/低値/)).toBeDefined();
  });

  it("1on1準備リンクが表示される", () => {
    render(<ConditionAlertSection members={[makeMember({ memberId: "xyz" })]} />);
    const link = screen.getByRole("link", { name: /1on1準備/ });
    expect((link as HTMLAnchorElement).getAttribute("href")).toContain("/members/xyz");
  });

  it("複数のアラートがあるメンバーのすべてのアラートを表示する", () => {
    render(
      <ConditionAlertSection
        members={[
          makeMember({
            alerts: [
              { type: "mood", label: "気分", values: [2, 3], trend: "declining" },
              { type: "conditionHealth", label: "健康状態", values: [1, 3], trend: "low" },
            ],
          }),
        ]}
      />,
    );
    expect(screen.getByText(/気分/)).toBeDefined();
    expect(screen.getByText(/健康状態/)).toBeDefined();
  });

  it("role=alert が設定されている", () => {
    render(<ConditionAlertSection members={[makeMember()]} />);
    expect(screen.getByRole("alert")).toBeDefined();
  });
});
