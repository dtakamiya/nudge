import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_WIDGET_SETTINGS,
  WIDGET_KEYS,
  WIDGET_LABELS,
  type WidgetSettings,
} from "@/hooks/use-dashboard-widget-settings";

import { DashboardSettingsPopover } from "../dashboard-settings-popover";

afterEach(() => {
  cleanup();
});

const allVisible: WidgetSettings = { ...DEFAULT_WIDGET_SETTINGS };

describe("DashboardSettingsPopover", () => {
  it("歯車ボタンが表示される", () => {
    render(
      <DashboardSettingsPopover
        settings={allVisible}
        visibleCount={WIDGET_KEYS.length}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "ウィジェット表示設定" })).toBeDefined();
  });

  it("歯車ボタンをクリックするとPopoverが開く", async () => {
    render(
      <DashboardSettingsPopover
        settings={allVisible}
        visibleCount={WIDGET_KEYS.length}
        onToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    expect(await screen.findByText("ウィジェット表示設定")).toBeDefined();
  });

  it("Popover内にすべてのウィジェット名が表示される", async () => {
    render(
      <DashboardSettingsPopover
        settings={allVisible}
        visibleCount={WIDGET_KEYS.length}
        onToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    for (const key of WIDGET_KEYS) {
      expect(await screen.findByText(WIDGET_LABELS[key])).toBeDefined();
    }
  });

  it("チェックボックスをクリックするとonToggleが呼ばれる", async () => {
    const onToggle = vi.fn();
    render(
      <DashboardSettingsPopover
        settings={allVisible}
        visibleCount={WIDGET_KEYS.length}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    const checkboxes = await screen.findAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("最後の1件の場合、そのチェックボックスはdisabledになる", async () => {
    const oneVisible: WidgetSettings = {
      ...DEFAULT_WIDGET_SETTINGS,
      healthScore: false,
      recentActivity: false,
      upcomingActions: false,
      scheduledMeetings: false,
      recommendedMeetings: false,
      memberList: false,
    };
    render(<DashboardSettingsPopover settings={oneVisible} visibleCount={1} onToggle={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    const checkboxes = await screen.findAllByRole("checkbox");
    // summary だけ true なので最初のチェックボックスが disabled
    const summaryCheckbox = checkboxes.find((cb) =>
      cb.getAttribute("aria-label")?.includes("サマリー"),
    );
    expect(summaryCheckbox?.hasAttribute("disabled")).toBe(true);
  });
});
