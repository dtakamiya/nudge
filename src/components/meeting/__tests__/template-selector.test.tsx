import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MEETING_TEMPLATES } from "@/lib/meeting-templates";

import { TemplateSelector } from "../template-selector";

const mockCustomTemplate = {
  id: "custom-1",
  name: "マイテンプレート",
  description: "カスタム説明",
  topics: [{ category: "WORK_PROGRESS", title: "カスタムトピック" }],
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => {
  cleanup();
});

describe("TemplateSelector", () => {
  it("renders all template options as apply buttons", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    const applyButtons = screen.getAllByRole("button", { name: /適用/ });
    expect(applyButtons.length).toBeGreaterThanOrEqual(MEETING_TEMPLATES.length);
  });

  it("shows template descriptions", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    for (const template of MEETING_TEMPLATES) {
      expect(screen.getByText(template.description)).toBeDefined();
    }
  });

  it("calls onSelect with template when 適用 button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplateSelector onSelect={onSelect} />);

    await user.click(
      screen.getByRole("button", { name: /定期チェックイン.*適用|適用.*定期チェックイン/ }),
    );
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "regular-checkin" }));
  });

  it("shows check icon only for selected template", () => {
    render(<TemplateSelector onSelect={vi.fn()} selectedId="career" />);
    const checkIcons = document.querySelectorAll("[data-testid='template-check-icon']");
    expect(checkIcons).toHaveLength(1);
  });

  it("does not show check icon when no template is selected", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    const checkIcons = document.querySelectorAll("[data-testid='template-check-icon']");
    expect(checkIcons).toHaveLength(0);
  });

  it("moves check icon when selection changes via onSelect call", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplateSelector onSelect={onSelect} selectedId="career" />);

    const checkIcons = document.querySelectorAll("[data-testid='template-check-icon']");
    expect(checkIcons).toHaveLength(1);

    const applyButtons = screen.getAllByRole("button", { name: /適用/ });
    await user.click(applyButtons[0]!);
    expect(onSelect).toHaveBeenCalled();
  });

  it("calls onAppend with template when 追加 button is clicked", async () => {
    const user = userEvent.setup();
    const onAppend = vi.fn();
    render(<TemplateSelector onSelect={vi.fn()} onAppend={onAppend} />);

    const appendButtons = screen.getAllByRole("button", { name: /追加/ });
    await user.click(appendButtons[0]!);
    expect(onAppend).toHaveBeenCalled();
  });

  it("does not show 追加 button when onAppend is not provided", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /追加/ })).toBeNull();
  });

  describe("カスタムテンプレート対応", () => {
    it("カスタムテンプレートを表示する", () => {
      render(<TemplateSelector onSelect={vi.fn()} customTemplates={[mockCustomTemplate]} />);
      expect(screen.getByText("マイテンプレート")).toBeDefined();
    });

    it("カスタムテンプレートに「カスタム」バッジを表示する", () => {
      render(<TemplateSelector onSelect={vi.fn()} customTemplates={[mockCustomTemplate]} />);
      expect(screen.getByText("カスタム")).toBeDefined();
    });

    it("ビルトインテンプレートには「カスタム」バッジを表示しない", () => {
      render(<TemplateSelector onSelect={vi.fn()} customTemplates={[mockCustomTemplate]} />);
      const badges = screen.getAllByText("カスタム");
      expect(badges).toHaveLength(1);
    });

    it("カスタムテンプレートの適用ボタンをクリックすると onSelect が呼ばれる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TemplateSelector onSelect={onSelect} customTemplates={[mockCustomTemplate]} />);
      const applyButtons = screen.getAllByRole("button", { name: /マイテンプレート.*適用|適用/ });
      await user.click(applyButtons[applyButtons.length - 1]!);
      expect(onSelect).toHaveBeenCalled();
    });

    it("カスタムテンプレートが選択されたときチェックアイコンを表示する", () => {
      render(
        <TemplateSelector
          onSelect={vi.fn()}
          selectedId="custom-1"
          customTemplates={[mockCustomTemplate]}
        />,
      );
      const checkIcons = document.querySelectorAll("[data-testid='template-check-icon']");
      expect(checkIcons).toHaveLength(1);
    });

    it("customTemplates が空でもビルトインテンプレートを表示する", () => {
      render(<TemplateSelector onSelect={vi.fn()} customTemplates={[]} />);
      for (const template of MEETING_TEMPLATES) {
        expect(screen.getByText(template.name)).toBeDefined();
      }
    });
  });
});
