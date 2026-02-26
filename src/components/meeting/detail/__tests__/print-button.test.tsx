import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrintButton } from "../print-button";

describe("PrintButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("「印刷 / PDFで保存」ボタンが表示される", () => {
    render(<PrintButton />);
    expect(screen.getByRole("button", { name: /印刷 \/ PDFで保存/ })).toBeInTheDocument();
  });

  it("クリック時に window.print() が呼ばれる", async () => {
    const printMock = vi.spyOn(window, "print").mockImplementation(() => undefined);

    const user = userEvent.setup();
    const { getByRole } = render(<PrintButton />);

    await user.click(getByRole("button", { name: /印刷 \/ PDFで保存/ }));

    expect(printMock).toHaveBeenCalledOnce();

    printMock.mockRestore();
  });
});
