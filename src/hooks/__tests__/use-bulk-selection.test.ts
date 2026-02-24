import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useBulkSelection } from "../use-bulk-selection";

describe("useBulkSelection", () => {
  it("初期状態は空の Set", () => {
    const { result } = renderHook(() => useBulkSelection());
    expect(result.current.count).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("toggleItem でアイテムを選択できる", () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => {
      result.current.toggleItem("id-1");
    });

    expect(result.current.count).toBe(1);
    expect(result.current.isSelected("id-1")).toBe(true);
  });

  it("toggleItem で選択済みアイテムを解除できる", () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => {
      result.current.toggleItem("id-1");
    });
    act(() => {
      result.current.toggleItem("id-1");
    });

    expect(result.current.count).toBe(0);
    expect(result.current.isSelected("id-1")).toBe(false);
  });

  it("複数アイテムを選択できる", () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => {
      result.current.toggleItem("id-1");
      result.current.toggleItem("id-2");
      result.current.toggleItem("id-3");
    });

    expect(result.current.count).toBe(3);
    expect(result.current.isSelected("id-1")).toBe(true);
    expect(result.current.isSelected("id-2")).toBe(true);
    expect(result.current.isSelected("id-3")).toBe(true);
  });

  it("selectAll で全アイテムを選択できる", () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => {
      result.current.selectAll(["id-1", "id-2", "id-3"]);
    });

    expect(result.current.count).toBe(3);
    expect(result.current.isSelected("id-1")).toBe(true);
    expect(result.current.isSelected("id-2")).toBe(true);
    expect(result.current.isSelected("id-3")).toBe(true);
  });

  it("clearAll で全選択を解除できる", () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => {
      result.current.selectAll(["id-1", "id-2", "id-3"]);
    });
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.count).toBe(0);
    expect(result.current.isSelected("id-1")).toBe(false);
  });

  it("isSelected は未選択のアイテムに false を返す", () => {
    const { result } = renderHook(() => useBulkSelection());

    expect(result.current.isSelected("unknown-id")).toBe(false);
  });

  it("selectedIds は不変オブジェクトを返す（イミュータブル）", () => {
    const { result } = renderHook(() => useBulkSelection());

    const prev = result.current.selectedIds;

    act(() => {
      result.current.toggleItem("id-1");
    });

    expect(result.current.selectedIds).not.toBe(prev);
  });
});
