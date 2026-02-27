import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_WIDGET_SETTINGS,
  WIDGET_KEYS,
  WIDGET_LABELS,
  type WidgetKey,
  type WidgetSettings,
} from "@/hooks/use-dashboard-widget-settings";

import { DashboardSettingsPopover } from "../dashboard-settings-popover";

afterEach(() => {
  cleanup();
});

const allVisible: WidgetSettings = { ...DEFAULT_WIDGET_SETTINGS };
const defaultOrder: WidgetKey[] = [...WIDGET_KEYS];

function renderPopover(
  overrides?: Partial<{
    settings: WidgetSettings;
    visibleCount: number;
    order: WidgetKey[];
    onToggle: () => void;
    onReorder: () => void;
  }>,
) {
  return render(
    <DashboardSettingsPopover
      settings={overrides?.settings ?? allVisible}
      visibleCount={overrides?.visibleCount ?? WIDGET_KEYS.length}
      order={overrides?.order ?? defaultOrder}
      onToggle={overrides?.onToggle ?? vi.fn()}
      onReorder={overrides?.onReorder ?? vi.fn()}
    />,
  );
}

describe("DashboardSettingsPopover", () => {
  it("歯車ボタンが表示される", () => {
    renderPopover();
    expect(screen.getByRole("button", { name: "ウィジェット表示設定" })).toBeDefined();
  });

  it("歯車ボタンをクリックするとPopoverが開く", async () => {
    renderPopover();
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    expect(await screen.findByText("ウィジェット表示設定")).toBeDefined();
  });

  it("Popover内にすべてのウィジェット名が表示される", async () => {
    renderPopover();
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    for (const key of WIDGET_KEYS) {
      expect(await screen.findByText(WIDGET_LABELS[key])).toBeDefined();
    }
  });

  it("チェックボックスをクリックするとonToggleが呼ばれる", async () => {
    const onToggle = vi.fn();
    renderPopover({ onToggle });
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
    renderPopover({ settings: oneVisible, visibleCount: 1 });
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    const checkboxes = await screen.findAllByRole("checkbox");
    const summaryCheckbox = checkboxes.find((cb) =>
      cb.getAttribute("aria-label")?.includes("サマリー"),
    );
    expect(summaryCheckbox?.hasAttribute("disabled")).toBe(true);
  });

  it("ドラッグハンドルが全ウィジェット分表示される", async () => {
    renderPopover();
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    for (const key of WIDGET_KEYS) {
      const label = WIDGET_LABELS[key];
      expect(await screen.findByRole("button", { name: `${label}を並び替え` })).toBeDefined();
    }
  });

  it("order に従った順序でウィジェットが表示される", async () => {
    const customOrder: WidgetKey[] = [
      "memberList",
      "summary",
      "healthScore",
      "recentActivity",
      "upcomingActions",
      "scheduledMeetings",
      "recommendedMeetings",
    ];
    renderPopover({ order: customOrder });
    fireEvent.click(screen.getByRole("button", { name: "ウィジェット表示設定" }));
    const labels = await screen.findAllByText(
      /サマリー|健全性スコア|最近のアクティビティ|今週のタスク|今週の1on1予定|1on1すべきメンバー|メンバー一覧/,
    );
    expect(labels[0].textContent).toBe("メンバー一覧");
    expect(labels[1].textContent).toBe("サマリー");
  });
});
