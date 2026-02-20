import { describe, it, expect } from "vitest";
import { getAvatarGradient, getInitials } from "../avatar";

describe("getInitials", () => {
  it("returns first character for single-word name", () => {
    expect(getInitials("田中")).toBe("田");
  });

  it("returns first characters of first and last for multi-word name", () => {
    expect(getInitials("田中 太郎")).toBe("田太");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("?");
  });
});

describe("getAvatarGradient", () => {
  it("returns a gradient tuple for a given name", () => {
    const result = getAvatarGradient("田中太郎");
    expect(result).toHaveLength(2);
    expect(result[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result[1]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("returns same gradient for same name", () => {
    const a = getAvatarGradient("佐藤");
    const b = getAvatarGradient("佐藤");
    expect(a).toEqual(b);
  });
});
