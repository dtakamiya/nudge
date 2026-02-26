import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ConditionBar, MAX_CONDITION } from "../condition-bar";

afterEach(() => {
  cleanup();
});

describe("ConditionBar", () => {
  it("MAX_CONDITION は 5 であること", () => {
    expect(MAX_CONDITION).toBe(5);
  });

  it("value=3 のとき ●●●○○（3/5）と表示されること", () => {
    render(<ConditionBar value={3} />);
    expect(screen.getByText(/3\/5/)).toBeDefined();
    expect(screen.getByText(/●●●○○/)).toBeDefined();
  });

  it("value=5 のとき ●●●●●（5/5）と表示されること", () => {
    render(<ConditionBar value={5} />);
    expect(screen.getByText(/5\/5/)).toBeDefined();
    expect(screen.getByText(/●●●●●/)).toBeDefined();
  });

  it("value=0 のとき ○○○○○（0/5）と表示されること", () => {
    render(<ConditionBar value={0} />);
    expect(screen.getByText(/0\/5/)).toBeDefined();
    expect(screen.getByText(/○○○○○/)).toBeDefined();
  });

  it("value が MAX_CONDITION を超える場合は MAX_CONDITION にクランプされること", () => {
    render(<ConditionBar value={10} />);
    expect(screen.getByText(/5\/5/)).toBeDefined();
  });

  it("value が 0 未満の場合は 0 にクランプされること", () => {
    render(<ConditionBar value={-1} />);
    expect(screen.getByText(/0\/5/)).toBeDefined();
  });
});
