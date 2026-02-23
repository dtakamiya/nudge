import { describe, expect, it } from "vitest";

import { getRandomIcebreaker, getRandomIcebreakers, ICEBREAKERS } from "@/lib/icebreakers";

describe("ICEBREAKERS", () => {
  it("30件以上のアイスブレイクが定義されていること", () => {
    expect(ICEBREAKERS.length).toBeGreaterThanOrEqual(30);
  });

  it("各アイスブレイクが id, category, question を持つこと", () => {
    for (const item of ICEBREAKERS) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("question");
      expect(typeof item.id).toBe("string");
      expect(typeof item.category).toBe("string");
      expect(typeof item.question).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.question.length).toBeGreaterThan(0);
    }
  });

  it("id がすべて一意であること", () => {
    const ids = ICEBREAKERS.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getRandomIcebreaker", () => {
  it("有効な Icebreaker を返すこと", () => {
    const result = getRandomIcebreaker();
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("question");
  });

  it("ICEBREAKERS リストに含まれる item を返すこと", () => {
    const result = getRandomIcebreaker();
    const found = ICEBREAKERS.find((item) => item.id === result.id);
    expect(found).toBeDefined();
  });

  it("excludeId を指定した場合、そのID以外のものを返すこと", () => {
    const firstItem = ICEBREAKERS[0];
    const result = getRandomIcebreaker(firstItem.id);
    expect(result.id).not.toBe(firstItem.id);
  });

  it("exclude を指定しない場合、全アイテムから選ばれること", () => {
    // 多数回試行してリスト内のアイテムが返ることを確認
    for (let i = 0; i < 10; i++) {
      const result = getRandomIcebreaker();
      const found = ICEBREAKERS.find((item) => item.id === result.id);
      expect(found).toBeDefined();
    }
  });
});

describe("getRandomIcebreakers", () => {
  it("指定した件数を返すこと", () => {
    const result = getRandomIcebreakers(5);
    expect(result).toHaveLength(5);
  });

  it("1件返すこと", () => {
    const result = getRandomIcebreakers(1);
    expect(result).toHaveLength(1);
  });

  it("0件の場合は空配列を返すこと", () => {
    const result = getRandomIcebreakers(0);
    expect(result).toHaveLength(0);
  });

  it("各 item が有効な Icebreaker であること", () => {
    const results = getRandomIcebreakers(3);
    for (const item of results) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("question");
    }
  });
});
