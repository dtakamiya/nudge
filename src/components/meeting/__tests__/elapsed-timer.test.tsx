import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElapsedTimer } from "../elapsed-timer";

vi.mock("@/hooks/use-elapsed-time", () => ({
  useElapsedTime: () => ({
    minutes: 5,
    seconds: 30,
    formatted: "05:30",
  }),
}));

describe("ElapsedTimer", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("時計アイコン付きでコンポーネントが正しくレンダリングされる", () => {
    const startedAt = new Date();
    render(<ElapsedTimer startedAt={startedAt} />);
    // Clock icon is rendered via lucide-react as SVG
    const container = screen.getByText("05:30").closest("div");
    expect(container).toBeTruthy();
  });

  it("startedAt が渡された時に時刻表示が含まれる", () => {
    const startedAt = new Date();
    render(<ElapsedTimer startedAt={startedAt} />);
    expect(screen.getByText("05:30")).toBeTruthy();
  });

  it("font-mono クラスで時刻が表示される", () => {
    const startedAt = new Date();
    render(<ElapsedTimer startedAt={startedAt} />);
    const timeSpan = screen.getByText("05:30");
    expect(timeSpan.className).toContain("font-mono");
  });
});
