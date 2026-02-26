import "@testing-library/jest-dom/vitest";

import React from "react";
import { vi } from "vitest";

// @testing-library/dom の jestFakeTimersAreEnabled() が正しく動作するように
// vitest の vi を jest グローバルとして設定する
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({
    children,
  }: {
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
  }) => React.createElement("div", null, children),
  BarChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "bar-chart" }, children),
  LineChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "line-chart" }, children),
  PieChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pie-chart" }, children),
  AreaChart: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "area-chart" }, children),
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  Area: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  DragOverlay: ({ children }: { children?: React.ReactNode }) =>
    children ? React.createElement(React.Fragment, null, children) : null,
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", null, children),
  verticalListSortingStrategy: {},
  arrayMove: vi.fn(<T>(arr: T[], from: number, to: number): T[] => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
}));

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
