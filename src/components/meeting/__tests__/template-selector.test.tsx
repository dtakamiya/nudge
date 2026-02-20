import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateSelector } from "../template-selector";
import { MEETING_TEMPLATES } from "@/lib/meeting-templates";

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
    expect(careerButton.className).toMatch(/border-primary|ring/);
  });
});
