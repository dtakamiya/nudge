import { describe, expect, it } from "vitest";

import {
  COACHING_TIPS,
  getRandomTipByCategory,
  getRandomTips,
  getTipsByCategory,
} from "@/lib/coaching-tips";

describe("COACHING_TIPS", () => {
  it("空でないこと", () => {
    expect(COACHING_TIPS.length).toBeGreaterThan(0);
  });

  it("各Tipが id, category, text を持つこと", () => {
    for (const tip of COACHING_TIPS) {
      expect(tip).toHaveProperty("id");
      expect(tip).toHaveProperty("category");
      expect(tip).toHaveProperty("text");
      expect(typeof tip.id).toBe("string");
      expect(typeof tip.category).toBe("string");
      expect(typeof tip.text).toBe("string");
      expect(tip.id.length).toBeGreaterThan(0);
      expect(tip.text.length).toBeGreaterThan(0);
    }
  });

  it("id がユニークであること", () => {
    const ids = COACHING_TIPS.map((tip) => tip.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("全5カテゴリにデータが存在すること", () => {
    const categories = ["傾聴", "質問", "承認・ねぎらい", "ベストプラクティス", "フィードバック"];
    for (const category of categories) {
      const tips = COACHING_TIPS.filter((tip) => tip.category === category);
      expect(tips.length).toBeGreaterThan(0);
    }
  });
});

describe("getRandomTipByCategory", () => {
  it("指定カテゴリのTipを返すこと", () => {
    const result = getRandomTipByCategory("傾聴");
    expect(result.category).toBe("傾聴");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("text");
  });

  it("各カテゴリで正しいTipを返すこと", () => {
    const categories = [
      "傾聴",
      "質問",
      "承認・ねぎらい",
      "ベストプラクティス",
      "フィードバック",
    ] as const;
    for (const category of categories) {
      const result = getRandomTipByCategory(category);
      expect(result.category).toBe(category);
    }
  });

  it("exclude が機能すること", () => {
    const tipsInCategory = COACHING_TIPS.filter((tip) => tip.category === "質問");
    // カテゴリに2件以上あることが前提
    expect(tipsInCategory.length).toBeGreaterThanOrEqual(2);

    const firstTip = tipsInCategory[0];
    // 複数回試行してexcludeが機能することを確認
    for (let i = 0; i < 20; i++) {
      const result = getRandomTipByCategory("質問", firstTip.id);
      expect(result.id).not.toBe(firstTip.id);
    }
  });

  it("COACHING_TIPS リストに含まれるTipを返すこと", () => {
    const result = getRandomTipByCategory("フィードバック");
    const found = COACHING_TIPS.find((tip) => tip.id === result.id);
    expect(found).toBeDefined();
  });
});

describe("getRandomTips", () => {
  it("指定件数を返すこと", () => {
    const result = getRandomTips(3);
    expect(result).toHaveLength(3);
  });

  it("1件を返すこと", () => {
    const result = getRandomTips(1);
    expect(result).toHaveLength(1);
  });

  it("getRandomTips(0) が空配列を返すこと", () => {
    const result = getRandomTips(0);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it("各itemが有効なCoachingTipであること", () => {
    const results = getRandomTips(5);
    for (const tip of results) {
      expect(tip).toHaveProperty("id");
      expect(tip).toHaveProperty("category");
      expect(tip).toHaveProperty("text");
    }
  });
});

describe("getTipsByCategory", () => {
  it("指定カテゴリのTipのみ返すこと", () => {
    const result = getTipsByCategory("傾聴");
    for (const tip of result) {
      expect(tip.category).toBe("傾聴");
    }
  });

  it("各カテゴリで正しいTipのみ返すこと", () => {
    const categories = [
      "傾聴",
      "質問",
      "承認・ねぎらい",
      "ベストプラクティス",
      "フィードバック",
    ] as const;
    for (const category of categories) {
      const result = getTipsByCategory(category);
      expect(result.length).toBeGreaterThan(0);
      for (const tip of result) {
        expect(tip.category).toBe(category);
      }
    }
  });

  it("COACHING_TIPS のサブセットを返すこと", () => {
    const result = getTipsByCategory("承認・ねぎらい");
    for (const tip of result) {
      const found = COACHING_TIPS.find((t) => t.id === tip.id);
      expect(found).toBeDefined();
    }
  });
});
