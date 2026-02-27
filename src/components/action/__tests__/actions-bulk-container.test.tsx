import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionsBulkContainer } from "../actions-bulk-container";

vi.mock("@/hooks/use-bulk-selection", () => ({
  useBulkSelection: () => ({
    selectedIds: new Set<string>(),
    toggleItem: vi.fn(),
    clearAll: vi.fn(),
  }),
}));

vi.mock("../action-list-full", () => ({
  ActionListFull: () => <div data-testid="action-list-full" />,
}));

vi.mock("../action-list-grouped", () => ({
  ActionListGrouped: () => <div data-testid="action-list-grouped" />,
}));

vi.mock("../action-pagination", () => ({
  ActionPagination: () => <div data-testid="action-pagination" />,
}));

vi.mock("../bulk-action-bar", () => ({
  BulkActionBar: () => <div data-testid="bulk-action-bar" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const defaultProps = {
  actionItems: [],
  groupBy: "none" as const,
  isGrouped: false,
  currentPage: 1,
  totalPages: 1,
  searchParams: {},
  hasMembers: true,
  hasFilter: false,
  total: 10,
};

describe("ActionsBulkContainer", () => {
  describe("件数バッジ", () => {
    it("フィルターなし状態で件数バッジを表示する", () => {
      render(<ActionsBulkContainer {...defaultProps} total={10} hasFilter={false} />);
      expect(screen.getByText("10 件")).toBeInTheDocument();
    });

    it("フィルターあり状態で件数バッジを表示する", () => {
      render(<ActionsBulkContainer {...defaultProps} total={3} hasFilter={true} />);
      expect(screen.getByText("3 件")).toBeInTheDocument();
    });

    it("total が 0 のとき 0 件と表示する", () => {
      render(<ActionsBulkContainer {...defaultProps} total={0} hasFilter={true} />);
      expect(screen.getByText("0 件")).toBeInTheDocument();
    });
  });
});
