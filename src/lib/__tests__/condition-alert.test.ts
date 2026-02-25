import { describe, expect, it } from "vitest";

import { detectConditionDecline } from "../condition-alert";

describe("detectConditionDecline", () => {
  describe("データ不足の場合", () => {
    it("値が0個の場合は null を返す", () => {
      expect(detectConditionDecline([], 2)).toBeNull();
    });

    it("値が1個の場合は null を返す", () => {
      expect(detectConditionDecline([3], 2)).toBeNull();
    });

    it("有効な値が1個しかない場合は null を返す", () => {
      expect(detectConditionDecline([3, null, null], 2)).toBeNull();
    });

    it("すべて null の場合は null を返す", () => {
      expect(detectConditionDecline([null, null, null], 2)).toBeNull();
    });
  });

  describe("低値検出", () => {
    it("最新値が閾値以下の場合は 'low' を返す", () => {
      expect(detectConditionDecline([2, 4, 5], 2)).toBe("low");
    });

    it("最新値が閾値と等しい場合は 'low' を返す", () => {
      expect(detectConditionDecline([2, 3, 4], 2)).toBe("low");
    });

    it("最新値が閾値より低い場合は 'low' を返す", () => {
      expect(detectConditionDecline([1, 3], 2)).toBe("low");
    });
  });

  describe("低下傾向検出", () => {
    it("2回分で連続低下している場合は 'declining' を返す", () => {
      expect(detectConditionDecline([3, 4], 2)).toBe("declining");
    });

    it("3回分で連続低下している場合は 'declining' を返す", () => {
      expect(detectConditionDecline([3, 4, 5], 2)).toBe("declining");
    });

    it("null が混在しても有効な値で連続低下なら 'declining' を返す", () => {
      expect(detectConditionDecline([3, null, 5], 2)).toBe("declining");
    });
  });

  describe("アラートなし", () => {
    it("値が安定している場合は null を返す", () => {
      expect(detectConditionDecline([4, 4, 4], 2)).toBeNull();
    });

    it("値が上昇している場合は null を返す", () => {
      expect(detectConditionDecline([5, 4, 3], 2)).toBeNull();
    });

    it("最新値が閾値より上で低下していない場合は null を返す", () => {
      expect(detectConditionDecline([4, 3], 2)).toBeNull();
    });
  });

  describe("低値と低下傾向の優先順位", () => {
    it("低下傾向かつ低値の場合は 'low' を優先する", () => {
      expect(detectConditionDecline([1, 2, 3], 2)).toBe("low");
    });
  });
});
