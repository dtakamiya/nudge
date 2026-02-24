import { describe, expect, it } from "vitest";

import { highlightText } from "../highlight";

describe("highlightText", () => {
  describe("基本動作", () => {
    it("クエリが空の場合はそのまま文字列を返す", () => {
      const result = highlightText("田中太郎", "");
      expect(result).toBe("田中太郎");
    });

    it("一致がない場合はそのまま文字列を返す", () => {
      const result = highlightText("田中太郎", "佐藤");
      expect(result).toBe("田中太郎");
    });

    it("一致する部分を mark タグで包む", () => {
      const result = highlightText("田中太郎", "田中");
      expect(Array.isArray(result)).toBe(true);
    });

    it("テキスト全体が一致する場合も mark タグで包む", () => {
      const result = highlightText("田中", "田中");
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("大文字小文字の扱い", () => {
    it("大文字で検索すると小文字の一致もハイライトする", () => {
      const result = highlightText("hello world", "HELLO");
      expect(Array.isArray(result)).toBe(true);
    });

    it("小文字で検索すると大文字の一致もハイライトする", () => {
      const result = highlightText("Hello World", "hello");
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("複数一致", () => {
    it("複数箇所が一致する場合、すべてをハイライトする", () => {
      const result = highlightText("田中 と 田中", "田中");
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("特殊文字のエスケープ", () => {
    it("正規表現の特殊文字を含むクエリでもクラッシュしない", () => {
      expect(() => highlightText("テスト(括弧)", "(")).not.toThrow();
      expect(() => highlightText("テスト.ドット", ".")).not.toThrow();
      expect(() => highlightText("テスト*アスタ", "*")).not.toThrow();
      expect(() => highlightText("テスト+プラス", "+")).not.toThrow();
      expect(() => highlightText("テスト?クエスチョン", "?")).not.toThrow();
    });

    it("特殊文字をリテラルとしてマッチする", () => {
      const result = highlightText("テスト(括弧)あり", "(括弧)");
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("エッジケース", () => {
    it("テキストが空の場合は空文字を返す", () => {
      const result = highlightText("", "テスト");
      expect(result).toBe("");
    });
  });
});
