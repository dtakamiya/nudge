import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrepareActionChecklist } from "../prepare-action-checklist";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItemStatus: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockActions = [
  {
    id: "a1",
    title: "資料作成",
    status: "TODO",
    dueDate: new Date("2026-02-28"),
    meeting: { date: new Date("2026-02-17") },
  },
  {
    id: "a2",
    title: "レビュー依頼",
    status: "IN_PROGRESS",
    dueDate: null,
    meeting: { date: new Date("2026-02-10") },
  },
];

describe("PrepareActionChecklist", () => {
  afterEach(() => cleanup());

  it("renders action item titles", () => {
    render(<PrepareActionChecklist pendingActions={mockActions} />);
    expect(screen.getByText("資料作成")).toBeDefined();
    expect(screen.getByText("レビュー依頼")).toBeDefined();
  });

  it("renders checkboxes for each action", () => {
    render(<PrepareActionChecklist pendingActions={mockActions} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("shows status badges", () => {
    render(<PrepareActionChecklist pendingActions={mockActions} />);
    expect(screen.getByText("未着手")).toBeDefined();
    expect(screen.getByText("進行中")).toBeDefined();
  });

  it("shows due date when available", () => {
    render(<PrepareActionChecklist pendingActions={mockActions} />);
    expect(screen.getByText(/2026.+2.+28/)).toBeDefined();
  });

  it("shows empty state when no pending actions", () => {
    render(<PrepareActionChecklist pendingActions={[]} />);
    expect(screen.getByText("未完了のアクションはありません")).toBeDefined();
  });

  it("calls updateActionItemStatus when checkbox is clicked", async () => {
    const { updateActionItemStatus } = await import("@/lib/actions/action-item-actions");
    const user = userEvent.setup();
    render(<PrepareActionChecklist pendingActions={mockActions} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(updateActionItemStatus).toHaveBeenCalledWith("a1", expect.any(String));
  });
});
