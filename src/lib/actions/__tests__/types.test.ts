import { describe, expect,it } from "vitest";

import { runAction } from "../types";

describe("runAction", () => {
  it("成功時に success: true とデータを返す", async () => {
    const result = await runAction(async () => ({ id: "1", name: "test" }));
    expect(result).toEqual({ success: true, data: { id: "1", name: "test" } });
  });

  it("Error がスローされた場合に success: false とメッセージを返す", async () => {
    const result = await runAction(async () => {
      throw new Error("テストエラー");
    });
    expect(result).toEqual({ success: false, error: "テストエラー" });
  });

  it("非 Error がスローされた場合にデフォルトメッセージを返す", async () => {
    const result = await runAction(async () => {
      throw "string error";
    });
    expect(result).toEqual({ success: false, error: "予期しないエラーが発生しました" });
  });
});
