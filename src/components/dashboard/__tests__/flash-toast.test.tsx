import { cleanup, render } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FlashToast } from "../flash-toast";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FlashToast", () => {
  it("deleted パラメータがある場合にトーストを表示する", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "deleted" ? "田中太郎" : null),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<FlashToast />);

    expect(toast.success).toHaveBeenCalledWith("田中太郎 を削除しました");
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("deleted パラメータがない場合は何もしない", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<FlashToast />);

    expect(toast.success).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("deleted パラメータが空文字の場合は何もしない", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "deleted" ? "" : null),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<FlashToast />);

    expect(toast.success).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("deleted パラメータが100文字を超える場合は何もしない", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "deleted" ? "あ".repeat(101) : null),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<FlashToast />);

    expect(toast.success).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("deleted パラメータがちょうど100文字の場合はトーストを表示する", async () => {
    const { useSearchParams } = await import("next/navigation");
    const name = "あ".repeat(100);
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "deleted" ? name : null),
    } as unknown as ReturnType<typeof useSearchParams>);

    render(<FlashToast />);

    expect(toast.success).toHaveBeenCalledWith(`${name} を削除しました`);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
