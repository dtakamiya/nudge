import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ActionItemEditForm } from "../action-item-edit-form";
import { TOAST_MESSAGES } from "@/lib/toast-messages";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUpdateActionItem = vi.fn();

vi.mock("@/lib/actions/action-item-actions", () => ({
  updateActionItem: (...args: unknown[]) => mockUpdateActionItem(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const defaultItem = {
  id: "action-1",
  title: "タスクA",
  description: "説明文",
  status: "TODO" as const,
  dueDate: new Date("2025-06-01"),
};

describe("ActionItemEditForm", () => {
  it("初期値が表示される", () => {
    render(<ActionItemEditForm actionItem={defaultItem} onSuccess={vi.fn()} />);
    const titleInput = screen.getByLabelText("タイトル *") as HTMLInputElement;
    expect(titleInput.value).toBe("タスクA");
    const descInput = screen.getByLabelText("説明") as HTMLTextAreaElement;
    expect(descInput.value).toBe("説明文");
    const dueDateInput = screen.getByLabelText("期限日") as HTMLInputElement;
    expect(dueDateInput.value).toBe("2025-06-01");
  });

  it("dueDate が null の場合、期限日は空", () => {
    render(
      <ActionItemEditForm actionItem={{ ...defaultItem, dueDate: null }} onSuccess={vi.fn()} />,
    );
    const dueDateInput = screen.getByLabelText("期限日") as HTMLInputElement;
    expect(dueDateInput.value).toBe("");
  });

  it("送信時に updateActionItem が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionItemEditForm actionItem={defaultItem} onSuccess={onSuccess} />);

    const titleInput = screen.getByLabelText("タイトル *");
    await user.clear(titleInput);
    await user.type(titleInput, "新タイトル");
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateActionItem).toHaveBeenCalledWith("action-1", {
      title: "新タイトル",
      description: "説明文",
      status: "TODO",
      dueDate: "2025-06-01",
    });
  });

  it("成功時に onSuccess とトーストが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionItemEditForm actionItem={defaultItem} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(onSuccess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateSuccess);
  });

  it("失敗時にエラーメッセージとトーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: false, error: "更新失敗" });
    render(<ActionItemEditForm actionItem={defaultItem} onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(screen.getByText("更新失敗")).toBeDefined();
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.actionItem.updateError);
  });

  it("期限日を空にするとnullが送信される", async () => {
    const user = userEvent.setup();
    mockUpdateActionItem.mockResolvedValue({ success: true, data: {} });
    render(<ActionItemEditForm actionItem={defaultItem} onSuccess={vi.fn()} />);

    const dueDateInput = screen.getByLabelText("期限日");
    await user.clear(dueDateInput);
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateActionItem).toHaveBeenCalledWith("action-1", {
      title: "タスクA",
      description: "説明文",
      status: "TODO",
      dueDate: null,
    });
  });
});
