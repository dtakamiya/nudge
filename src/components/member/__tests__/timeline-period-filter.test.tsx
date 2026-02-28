import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TimelinePeriodFilter } from "../timeline-period-filter";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TimelinePeriodFilter", () => {
  it("デフォルトで「全期間」が選択されている", () => {
    render(<TimelinePeriodFilter value="all" onChange={vi.fn()} />);
    expect(screen.getByText("全期間")).toBeDefined();
  });

  it("「直近3ヶ月」を値に設定すると表示される", () => {
    render(<TimelinePeriodFilter value="3months" onChange={vi.fn()} />);
    expect(screen.getByText("直近3ヶ月")).toBeDefined();
  });

  it("「直近1ヶ月」を値に設定すると表示される", () => {
    render(<TimelinePeriodFilter value="1month" onChange={vi.fn()} />);
    expect(screen.getByText("直近1ヶ月")).toBeDefined();
  });

  it("aria-label が設定されている", () => {
    render(<TimelinePeriodFilter value="all" onChange={vi.fn()} />);
    expect(screen.getByLabelText("期間フィルタ")).toBeDefined();
  });
});
