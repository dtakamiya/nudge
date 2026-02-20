import { vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
