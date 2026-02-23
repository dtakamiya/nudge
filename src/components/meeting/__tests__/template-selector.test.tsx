import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MEETING_TEMPLATES } from "@/lib/meeting-templates";

import { TemplateSelector } from "../template-selector";

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
});
