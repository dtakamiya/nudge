import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PriorityBadge } from "../priority-badge";

afterEach(() => {
  cleanup();
});

describe("PriorityBadge", () => {
  it("HIGH のとき「高」と表示される", () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText("高")).toBeDefined();
  });

  it("MEDIUM のとき「中」と表示される", () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText("中")).toBeDefined();
  });

  it("LOW のとき「低」と表示される", () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText("低")).toBeDefined();
  });

  it("HIGH のとき赤系のスタイルが適用される", () => {
    const { container } = render(<PriorityBadge priority="HIGH" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-red");
  });

  it("MEDIUM のとき黄系のスタイルが適用される", () => {
    const { container } = render(<PriorityBadge priority="MEDIUM" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-amber");
  });

  it("LOW のとき緑系のスタイルが適用される", () => {
    const { container } = render(<PriorityBadge priority="LOW" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("text-green");
  });
});
