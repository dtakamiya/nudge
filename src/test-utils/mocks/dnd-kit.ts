import React from "react";
import { vi } from "vitest";

export const sortableMock = {
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  verticalListSortingStrategy: {},
  arrayMove: vi.fn(<T>(arr: T[], from: number, to: number): T[] => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  }),
};

export const dndCoreMock = {
  DndContext: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  DragOverlay: ({ children }: { children?: React.ReactNode }) =>
    children ? React.createElement(React.Fragment, null, children) : null,
};
