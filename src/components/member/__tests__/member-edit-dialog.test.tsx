import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemberEditDialog } from "../member-edit-dialog";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
  }),
}));

const mockUpdateMember = vi.fn();

vi.mock("@/lib/actions/member-actions", () => ({
  createMember: vi.fn(),
  updateMember: (...args: unknown[]) => mockUpdateMember(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const member = {
  id: "member-1",
  name: "田中太郎",
  department: "エンジニアリング",
  position: "シニアエンジニア",
};

describe("MemberEditDialog", () => {
  it("「編集」ボタンが表示される", () => {
    render(<MemberEditDialog member={member} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeDefined();
  });

  it("ボタンクリックでダイアログが開く", async () => {
    const user = userEvent.setup();
    render(<MemberEditDialog member={member} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));

    expect(screen.getByText("メンバー情報の編集")).toBeDefined();
    expect(screen.getByText("名前、部署、役職を変更できます。")).toBeDefined();
  });

  it("ダイアログ内にメンバーの初期値が表示される", async () => {
    const user = userEvent.setup();
    render(<MemberEditDialog member={member} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));

    const nameInput = screen.getByLabelText("名前 *") as HTMLInputElement;
    expect(nameInput.value).toBe("田中太郎");
  });

  it("更新成功後にダイアログが閉じ、router.refresh が呼ばれる", async () => {
    const user = userEvent.setup();
    mockUpdateMember.mockResolvedValue({ success: true, data: {} });
    render(<MemberEditDialog member={member} />);

    await user.click(screen.getByRole("button", { name: /編集/ }));
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateMember).toHaveBeenCalledWith("member-1", {
      name: "田中太郎",
      department: "エンジニアリング",
      position: "シニアエンジニア",
      meetingIntervalDays: 14,
    });
    expect(mockRefresh).toHaveBeenCalled();
  });
});
