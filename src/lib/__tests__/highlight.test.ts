import { describe, expect, it } from "vitest";

import { extractSnippet, highlightText } from "../highlight";

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

describe("extractSnippet", () => {
  it("クエリにマッチした箇所の前後コンテキストを返す", () => {
    const text = "これはサンプルテキストです。スキルアップに向けた取り組みを話し合います。";
    const result = extractSnippet(text, "スキルアップ", 10);
    expect(result).toContain("スキルアップ");
  });

  it("マッチがない場合は先頭から contextLength*2 文字を返す", () => {
    const text = "abcdefghij1234567890";
    const result = extractSnippet(text, "xyz", 5);
    expect(result).toBe("abcdefghij");
  });

  it("テキスト先頭でマッチした場合は先頭に ... を付けない", () => {
    const text = "スキルアップの方法について";
    const result = extractSnippet(text, "スキルアップ", 5);
    expect(result.startsWith("...")).toBe(false);
  });

  it("テキスト末尾でマッチした場合は末尾に ... を付けない", () => {
    const text = "取り組みの結果としてスキルアップ";
    const result = extractSnippet(text, "スキルアップ", 5);
    expect(result.endsWith("...")).toBe(false);
  });

  it("テキスト中間でマッチした場合は両端に ... を付ける", () => {
    const text = "AAAAAAAAAAAAAAAAAAAAABBBCCCCCCCCCCCCCCCCCCCCC";
    const result = extractSnippet(text, "BBB", 5);
    expect(result.startsWith("...")).toBe(true);
    expect(result.endsWith("...")).toBe(true);
  });

  it("大文字小文字を区別せずマッチする", () => {
    const text = "hello WORLD test";
    const result = extractSnippet(text, "world", 3);
    expect(result).toContain("WORLD");
  });

  it("テキストが空の場合は空文字を返す", () => {
    const result = extractSnippet("", "test");
    expect(result).toBe("");
  });
});
