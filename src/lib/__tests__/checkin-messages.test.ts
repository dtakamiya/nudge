import { describe, expect, it } from "vitest";

import { CHECKIN_MESSAGES, getRandomCheckinMessage } from "@/lib/checkin-messages";

describe("CHECKIN_MESSAGES", () => {
  it("10件以上のメッセージが定義されていること", () => {
    expect(CHECKIN_MESSAGES.length).toBeGreaterThanOrEqual(10);
  });

  it("全メッセージが空でないこと", () => {
    for (const message of CHECKIN_MESSAGES) {
      expect(message.trim().length).toBeGreaterThan(0);
    }
  });

  it("全メッセージが文字列であること", () => {
    for (const message of CHECKIN_MESSAGES) {
      expect(typeof message).toBe("string");
    }
  });
});

describe("getRandomCheckinMessage", () => {
  it("文字列を返すこと", () => {
    const result = getRandomCheckinMessage();
    expect(typeof result).toBe("string");
  });

  it("CHECKIN_MESSAGES に含まれるメッセージを返すこと", () => {
    const result = getRandomCheckinMessage();
    expect(CHECKIN_MESSAGES).toContain(result);
  });

  it("空でない文字列を返すこと", () => {
    const result = getRandomCheckinMessage();
    expect(result.trim().length).toBeGreaterThan(0);
  });
});
