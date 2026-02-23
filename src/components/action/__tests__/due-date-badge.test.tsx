import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DueDateBadge } from "../due-date-badge";

afterEach(() => {
  cleanup();
});

describe("DueDateBadge", () => {
  it("期限超過のアイテムに「期限超過」バッジを表示する", () => {
    const pastDate = new Date("2020-01-01");
    render(<DueDateBadge dueDate={pastDate} status="TODO" />);
    expect(screen.getByText("期限超過")).toBeDefined();
  });

  it("期限3日以内のアイテムに「もうすぐ期限」バッジを表示する", () => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    render(<DueDateBadge dueDate={twoDaysFromNow} status="TODO" />);
    expect(screen.getByText("もうすぐ期限")).toBeDefined();
  });

  it("DONE ステータスでは期限超過でも通常の期限テキストを表示する", () => {
    const pastDate = new Date("2020-01-01");
    render(<DueDateBadge dueDate={pastDate} status="DONE" />);
    expect(screen.queryByText("期限超過")).toBeNull();
    expect(screen.queryByText("もうすぐ期限")).toBeNull();
    expect(screen.getByText(/期限:/)).toBeDefined();
  });

  it("4日以上先の期限は通常の期限テキストを表示する", () => {
    const farFuture = new Date("2099-12-31");
    render(<DueDateBadge dueDate={farFuture} status="TODO" />);
    expect(screen.getByText(/期限:/)).toBeDefined();
    expect(screen.queryByText("期限超過")).toBeNull();
    expect(screen.queryByText("もうすぐ期限")).toBeNull();
  });

  it("size='sm' のとき text-xs クラスが適用される", () => {
    const farFuture = new Date("2099-12-31");
    render(<DueDateBadge dueDate={farFuture} status="TODO" size="sm" />);
    const element = screen.getByText(/期限:/);
    expect(element.className).toContain("text-xs");
  });

  it("size='default' のとき text-sm クラスが適用される", () => {
    const farFuture = new Date("2099-12-31");
    render(<DueDateBadge dueDate={farFuture} status="TODO" size="default" />);
    const element = screen.getByText(/期限:/);
    expect(element.className).toContain("text-sm");
  });

  it("IN_PROGRESS ステータスでも期限超過バッジを表示する", () => {
    const pastDate = new Date("2020-01-01");
    render(<DueDateBadge dueDate={pastDate} status="IN_PROGRESS" />);
    expect(screen.getByText("期限超過")).toBeDefined();
  });
});
