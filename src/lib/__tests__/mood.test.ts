import { describe, expect, it } from "vitest";

import { getMoodOption, MOOD_OPTIONS } from "@/lib/mood";

describe("MOOD_OPTIONS", () => {
  it("5 つの選択肢を持つ", () => {
    expect(MOOD_OPTIONS).toHaveLength(5);
  });

  it("value が 1〜5 で昇順になっている", () => {
    const values = MOOD_OPTIONS.map((o) => o.value);
    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  it("各オプションに emoji と label がある", () => {
    for (const option of MOOD_OPTIONS) {
      expect(option.emoji).toBeTruthy();
      expect(option.label).toBeTruthy();
    }
  });
});

describe("getMoodOption", () => {
  it("1〜5 の値に対応するオプションを返す", () => {
    for (let i = 1; i <= 5; i++) {
      const option = getMoodOption(i);
      expect(option).not.toBeNull();
      expect(option?.value).toBe(i);
    }
  });

  it("null を渡すと null を返す", () => {
    expect(getMoodOption(null)).toBeNull();
  });

  it("undefined を渡すと null を返す", () => {
    expect(getMoodOption(undefined)).toBeNull();
  });

  it("範囲外の値は null を返す", () => {
    expect(getMoodOption(0)).toBeNull();
    expect(getMoodOption(6)).toBeNull();
  });
});
