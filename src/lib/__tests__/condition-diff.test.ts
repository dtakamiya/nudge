import { describe, expect, it } from "vitest";

import { calculateConditionDiff, formatConditionDiff } from "../condition-diff";

describe("calculateConditionDiff", () => {
  it("currentがnullのときnullを返す", () => {
    expect(calculateConditionDiff(null, 3)).toBeNull();
  });

  it("previousがnullのときnullを返す", () => {
    expect(calculateConditionDiff(3, null)).toBeNull();
  });

  it("両方nullのときnullを返す", () => {
    expect(calculateConditionDiff(null, null)).toBeNull();
  });

  it("currentがpreviousより大きいとき正のdiffとdirection=upを返す", () => {
    expect(calculateConditionDiff(4, 3)).toEqual({ diff: 1, direction: "up" });
  });

  it("current===previousのときdiff=0とdirection=sameを返す", () => {
    expect(calculateConditionDiff(3, 3)).toEqual({ diff: 0, direction: "same" });
  });

  it("currentがpreviousより小さいとき負のdiffとdirection=downを返す", () => {
    expect(calculateConditionDiff(1, 3)).toEqual({ diff: -2, direction: "down" });
  });

  it("最大差分(5-1=+4)を正しく計算する", () => {
    expect(calculateConditionDiff(5, 1)).toEqual({ diff: 4, direction: "up" });
  });
});

describe("formatConditionDiff", () => {
  it("nullのときnullを返す", () => {
    expect(formatConditionDiff(null)).toBeNull();
  });

  it("direction=upのとき'↑ 前回より+N'を返す", () => {
    expect(formatConditionDiff({ diff: 1, direction: "up" })).toBe("↑ 前回より+1");
  });

  it("direction=upで差分2のとき'↑ 前回より+2'を返す", () => {
    expect(formatConditionDiff({ diff: 2, direction: "up" })).toBe("↑ 前回より+2");
  });

  it("direction=sameのとき'─ 前回と同じ'を返す", () => {
    expect(formatConditionDiff({ diff: 0, direction: "same" })).toBe("─ 前回と同じ");
  });

  it("direction=downのとき'↓ 前回より-N'を返す", () => {
    expect(formatConditionDiff({ diff: -2, direction: "down" })).toBe("↓ 前回より-2");
  });

  it("direction=downで差分-1のとき'↓ 前回より-1'を返す", () => {
    expect(formatConditionDiff({ diff: -1, direction: "down" })).toBe("↓ 前回より-1");
  });
});
