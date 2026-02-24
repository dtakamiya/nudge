import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useChartMounted } from "../use-chart-mounted";

describe("useChartMounted", () => {
  it("テスト環境では同期的に true を返す", () => {
    const { result } = renderHook(() => useChartMounted());
    expect(result.current).toBe(true);
  });

  it("複数のフックインスタンスで同じ値を返す", () => {
    const { result: result1 } = renderHook(() => useChartMounted());
    const { result: result2 } = renderHook(() => useChartMounted());
    expect(result1.current).toBe(result2.current);
  });

  it("boolean 型を返す", () => {
    const { result } = renderHook(() => useChartMounted());
    expect(typeof result.current).toBe("boolean");
  });
});
