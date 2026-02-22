import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TOAST_MESSAGES } from "@/lib/toast-messages";

import { MemberForm } from "../member-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCreateMember = vi.fn();
const mockUpdateMember = vi.fn();

vi.mock("@/lib/actions/member-actions", () => ({
  createMember: (...args: unknown[]) => mockCreateMember(...args),
  updateMember: (...args: unknown[]) => mockUpdateMember(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MemberForm - 新規作成モード", () => {
  it("「メンバー登録」タイトルが表示される", () => {
    render(<MemberForm />);
    expect(screen.getByText("メンバー登録")).toBeDefined();
  });

  it("「登録する」ボタンが表示される", () => {
    render(<MemberForm />);
    expect(screen.getByRole("button", { name: "登録する" })).toBeDefined();
  });

  it("空の入力フィールドが表示される", () => {
    render(<MemberForm />);
    const nameInput = screen.getByLabelText("名前 *") as HTMLInputElement;
    const deptInput = screen.getByLabelText("部署") as HTMLInputElement;
    const posInput = screen.getByLabelText("役職") as HTMLInputElement;
    expect(nameInput.value).toBe("");
    expect(deptInput.value).toBe("");
    expect(posInput.value).toBe("");
  });

  it("送信時に createMember が呼ばれる", async () => {
    const user = userEvent.setup();
    mockCreateMember.mockResolvedValue({ success: true, data: {} });
    render(<MemberForm />);

    await user.type(screen.getByLabelText("名前 *"), "山田花子");
    await user.type(screen.getByLabelText("部署"), "デザイン");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(mockCreateMember).toHaveBeenCalledWith({
      name: "山田花子",
      department: "デザイン",
      position: undefined,
      meetingIntervalDays: 14,
    });
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.member.createSuccess);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("ミーティング間隔セレクトが表示される（デフォルト14日）", () => {
    render(<MemberForm />);
    expect(screen.getByLabelText("ミーティング間隔")).toBeDefined();
    const select = screen.getByLabelText("ミーティング間隔") as HTMLSelectElement;
    expect(select.value).toBe("14");
  });

  it("ミーティング間隔を7日に変更して送信できる", async () => {
    const user = userEvent.setup();
    mockCreateMember.mockResolvedValue({ success: true, data: {} });
    render(<MemberForm />);

    await user.type(screen.getByLabelText("名前 *"), "テストメンバー");
    await user.selectOptions(screen.getByLabelText("ミーティング間隔"), "7");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(mockCreateMember).toHaveBeenCalledWith(
      expect.objectContaining({ meetingIntervalDays: 7 }),
    );
  });

  it("エラー時にエラーメッセージとトーストが表示される", async () => {
    const user = userEvent.setup();
    mockCreateMember.mockResolvedValue({ success: false, error: "登録に失敗しました" });
    render(<MemberForm />);

    await user.type(screen.getByLabelText("名前 *"), "テスト");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(screen.getByText("登録に失敗しました")).toBeDefined();
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.member.createError);
  });
});

describe("MemberForm - 編集モード", () => {
  const initialData = {
    id: "member-1",
    name: "田中太郎",
    department: "エンジニアリング",
    position: "シニアエンジニア",
    meetingIntervalDays: 14,
  };

  it("「メンバー登録」タイトルが表示されない（Card なし）", () => {
    render(<MemberForm initialData={initialData} />);
    expect(screen.queryByText("メンバー登録")).toBeNull();
  });

  it("「更新する」ボタンが表示される", () => {
    render(<MemberForm initialData={initialData} />);
    expect(screen.getByRole("button", { name: "更新する" })).toBeDefined();
  });

  it("初期値がフォームに入力されている", () => {
    render(<MemberForm initialData={initialData} />);
    const nameInput = screen.getByLabelText("名前 *") as HTMLInputElement;
    const deptInput = screen.getByLabelText("部署") as HTMLInputElement;
    const posInput = screen.getByLabelText("役職") as HTMLInputElement;
    expect(nameInput.value).toBe("田中太郎");
    expect(deptInput.value).toBe("エンジニアリング");
    expect(posInput.value).toBe("シニアエンジニア");
  });

  it("送信時に updateMember が呼ばれる", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockUpdateMember.mockResolvedValue({ success: true, data: {} });
    render(<MemberForm initialData={initialData} onSuccess={onSuccess} />);

    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "田中次郎");
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateMember).toHaveBeenCalledWith("member-1", {
      name: "田中次郎",
      department: "エンジニアリング",
      position: "シニアエンジニア",
      meetingIntervalDays: 14,
    });
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.member.updateSuccess);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("エラー時にエラーメッセージとトーストが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateMember.mockResolvedValue({ success: false, error: "更新に失敗しました" });
    render(<MemberForm initialData={initialData} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(screen.getByText("更新に失敗しました")).toBeDefined();
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.member.updateError);
  });

  it("初期値の department が null の場合、空文字で表示される", () => {
    render(<MemberForm initialData={{ ...initialData, department: null }} />);
    const deptInput = screen.getByLabelText("部署") as HTMLInputElement;
    expect(deptInput.value).toBe("");
  });

  it("初期値の meetingIntervalDays がセレクトに反映される", () => {
    render(<MemberForm initialData={{ ...initialData, meetingIntervalDays: 30 }} />);
    const select = screen.getByLabelText("ミーティング間隔") as HTMLSelectElement;
    expect(select.value).toBe("30");
  });
});
