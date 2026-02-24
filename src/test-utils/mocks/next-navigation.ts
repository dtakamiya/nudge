import { vi } from "vitest";

export interface MockRouter {
  push: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
}

export function createNavigationMock() {
  const mockRouter: MockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockSearchParams = new URLSearchParams();
  const mockPathname = "/";

  const navigationMock = {
    useRouter: () => mockRouter,
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname,
  };

  return { mockRouter, navigationMock };
}
