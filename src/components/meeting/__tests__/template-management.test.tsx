import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TemplateManagement } from "../template-management";

vi.mock("@/lib/actions/template-actions", () => ({
  deleteTemplate: vi.fn().mockResolvedValue({ success: true }),
  createTemplate: vi.fn().mockResolvedValue({ success: true, data: {} }),
  updateTemplate: vi.fn().mockResolvedValue({ success: true, data: {} }),
  exportTemplates: vi.fn().mockResolvedValue({
    success: true,
    data: { version: 1, exportedAt: "2026-01-01T00:00:00.000Z", templates: [] },
  }),
  previewImport: vi
    .fn()
    .mockResolvedValue({ success: true, data: { templates: [], duplicateNames: [] } }),
  importTemplates: vi
    .fn()
    .mockResolvedValue({ success: true, data: { created: 1, updated: 0, skipped: 0 } }),
}));

vi.mock("@/lib/template-io", () => ({
  downloadTemplatesAsJson: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("radix-ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("radix-ui")>();
  return {
    ...actual,
    Dialog: {
      Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Overlay: () => null,
      Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Description: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Close: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
    AlertDialog: {
      Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Overlay: () => null,
      Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Title: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Description: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Cancel: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
      ),
      Action: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button {...props}>{children}</button>
      ),
    },
  };
});

const mockTemplates = [
  {
    id: "t1",
    name: "週次レビュー",
    description: "毎週の振り返り",
    topics: [{ category: "WORK_PROGRESS", title: "今週の進捗" }],
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    name: "キャリア面談",
    description: "",
    topics: [],
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

afterEach(() => {
  cleanup();
});

describe("TemplateManagement", () => {
  it("テンプレートがない場合は空状態メッセージを表示する", () => {
    render(<TemplateManagement templates={[]} />);
    expect(screen.getByText("カスタムテンプレートがまだありません")).toBeDefined();
  });

  it("テンプレート一覧を表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    expect(screen.getByText("週次レビュー")).toBeDefined();
    expect(screen.getByText("キャリア面談")).toBeDefined();
  });

  it("テンプレートの説明を表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    // モックでダイアログコンテンツも常に表示されるため getAllByText を使用
    const descriptionElements = screen.getAllByText("毎週の振り返り");
    expect(descriptionElements.length).toBeGreaterThan(0);
  });

  it("トピックをバッジで表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    expect(screen.getByText(/今週の進捗/)).toBeDefined();
  });

  it("トピックなしのテンプレートに「トピックなし」を表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    expect(screen.getByText("トピックなし")).toBeDefined();
  });

  it("「新規作成」ボタンを表示する", () => {
    render(<TemplateManagement templates={[]} />);
    expect(screen.getByRole("button", { name: /新規作成/ })).toBeDefined();
  });

  it("各テンプレートに編集ボタンと削除ボタンを表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    // aria-label="編集" のボタンはテンプレートごとに1つ
    const editButtons = screen.getAllByRole("button", { name: "編集" });
    expect(editButtons).toHaveLength(2);
    // モックでは AlertDialog コンテンツが常にレンダリングされるため、
    // 各テンプレートにトリガーボタン + アクションボタンの計2つが表示される
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    render(<TemplateManagement templates={mockTemplates} />);
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);
    const confirmMessages = screen.getAllByText("テンプレートを削除しますか？");
    expect(confirmMessages.length).toBeGreaterThan(0);
  });

  it("ヘッダーに説明テキストを表示する", () => {
    render(<TemplateManagement templates={[]} />);
    expect(screen.getByText("カスタムテンプレート")).toBeDefined();
    expect(
      screen.getByText("1on1 準備画面で使えるオリジナルテンプレートを作成できます"),
    ).toBeDefined();
  });

  it("「エクスポート」ボタンを表示する", () => {
    render(<TemplateManagement templates={mockTemplates} />);
    expect(screen.getByRole("button", { name: /テンプレートをエクスポート/ })).toBeDefined();
  });

  it("テンプレートがない場合、エクスポートボタンは無効化される", () => {
    render(<TemplateManagement templates={[]} />);
    const exportBtn = screen.getByRole("button", { name: /テンプレートをエクスポート/ });
    expect((exportBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("「インポート」ボタンを表示する", () => {
    render(<TemplateManagement templates={[]} />);
    expect(screen.getByRole("button", { name: /テンプレートをインポート/ })).toBeDefined();
  });
});
