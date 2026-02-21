import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemberForm } from "../member-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
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
    mockCreateMember.mockResolvedValue({});
    render(<MemberForm />);

    await user.type(screen.getByLabelText("名前 *"), "山田花子");
    await user.type(screen.getByLabelText("部署"), "デザイン");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(mockCreateMember).toHaveBeenCalledWith({
      name: "山田花子",
      department: "デザイン",
      position: undefined,
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockCreateMember.mockRejectedValue(new Error("登録に失敗しました"));
    render(<MemberForm />);

    await user.type(screen.getByLabelText("名前 *"), "テスト");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(screen.getByText("登録に失敗しました")).toBeDefined();
  });
});

describe("MemberForm - 編集モード", () => {
  const initialData = {
    id: "member-1",
    name: "田中太郎",
    department: "エンジニアリング",
    position: "シニアエンジニア",
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
    mockUpdateMember.mockResolvedValue({});
    render(<MemberForm initialData={initialData} onSuccess={onSuccess} />);

    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "田中次郎");
    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockUpdateMember).toHaveBeenCalledWith("member-1", {
      name: "田中次郎",
      department: "エンジニアリング",
      position: "シニアエンジニア",
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    mockUpdateMember.mockRejectedValue(new Error("更新に失敗しました"));
    render(<MemberForm initialData={initialData} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(screen.getByText("更新に失敗しました")).toBeDefined();
  });

  it("初期値の department が null の場合、空文字で表示される", () => {
    render(<MemberForm initialData={{ ...initialData, department: null }} />);
    const deptInput = screen.getByLabelText("部署") as HTMLInputElement;
    expect(deptInput.value).toBe("");
  });
});
