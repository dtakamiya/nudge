import { cleanup, render } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FlashToast } from "../flash-toast";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
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
});
