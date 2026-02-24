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
  it("renders all template options as buttons", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    for (const template of MEETING_TEMPLATES) {
      expect(screen.getByRole("button", { name: new RegExp(template.name) })).toBeDefined();
    }
  });

  it("shows template descriptions", () => {
    render(<TemplateSelector onSelect={vi.fn()} />);
    for (const template of MEETING_TEMPLATES) {
      expect(screen.getByText(template.description)).toBeDefined();
    }
  });

  it("calls onSelect with template when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplateSelector onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /定期チェックイン/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "regular-checkin" }));
  });

  it("highlights the selected template", () => {
    render(<TemplateSelector onSelect={vi.fn()} selectedId="career" />);
    const careerButton = screen.getByRole("button", { name: /キャリア面談/ });
    expect(careerButton.className).toMatch(/ring-2/);
    expect(careerButton.className).toMatch(/border-primary/);
  });

  it("applies background color to selected template", () => {
    render(<TemplateSelector onSelect={vi.fn()} selectedId="career" />);
    const careerButton = screen.getByRole("button", { name: /キャリア面談/ });
    expect(careerButton.className).toMatch(/bg-primary/);
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

  it("moves check icon when selection changes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TemplateSelector onSelect={onSelect} selectedId="career" />);

    const checkIcons = document.querySelectorAll("[data-testid='template-check-icon']");
    expect(checkIcons).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /定期チェックイン/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "regular-checkin" }));
  });

  describe("カスタムテンプレート対応", () => {
    it("カスタムテンプレートを表示する", () => {
      render(<TemplateSelector onSelect={vi.fn()} customTemplates={[mockCustomTemplate]} />);
      expect(screen.getByRole("button", { name: /マイテンプレート/ })).toBeDefined();
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

    it("カスタムテンプレートをクリックすると onSelect が呼ばれる", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<TemplateSelector onSelect={onSelect} customTemplates={[mockCustomTemplate]} />);
      await user.click(screen.getByRole("button", { name: /マイテンプレート/ }));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "custom-1",
          name: "マイテンプレート",
        }),
      );
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
        expect(screen.getByRole("button", { name: new RegExp(template.name) })).toBeDefined();
      }
    });
  });
});
