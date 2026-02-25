#!/usr/bin/env node
/**
 * 修正値探索ツール
 * 各問題のある色について、WCAG AA を満たす最小限の L 値変更を探す
 */

function parseOklch(oklchStr) {
  const match = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) throw new Error(`パース失敗: ${oklchStr}`);
  return { L: parseFloat(match[1]), C: parseFloat(match[2]), h: parseFloat(match[3]) };
}

function oklchToLinearSrgb(L, C, h) {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function oklchToLuminance(L, C, h) {
  const { r, g, b } = oklchToLinearSrgb(L, C, h);
  const clamp = (v) => Math.max(0, v);
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b);
}

function oklchStrToLuminance(str) {
  const { L, C, h } = parseOklch(str);
  return oklchToLuminance(L, C, h);
}

function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 対象色の L 値を変化させて WCAG AA（4.5:1）を達成する最小値を探す
 * @param {object} param
 * @param {number} param.C - 彩度
 * @param {number} param.h - 色相
 * @param {string} param.bgStr - 背景色の oklch 文字列
 * @param {boolean} param.darken - true = L を下げる方向、false = L を上げる方向
 * @param {number} param.startL - 開始 L 値
 */
function findOptimalL({ C, h, bgStr, darken, startL }) {
  const bgLum = oklchStrToLuminance(bgStr);
  const step = darken ? -0.01 : 0.01;
  let L = startL;
  for (let i = 0; i < 100; i++) {
    const fgLum = oklchToLuminance(L, C, h);
    const ratio = contrastRatio(fgLum, bgLum);
    if (ratio >= 4.5) {
      return { L: Math.round(L * 100) / 100, ratio };
    }
    L += step;
    if (L < 0 || L > 1) break;
  }
  return null;
}

console.log("=".repeat(60));
console.log("修正値探索");
console.log("=".repeat(60));

// ============================================================
// 問題1: ライトモード muted-foreground vs muted
// 現状: oklch(0.55 0.01 260) vs oklch(0.96 0.005 260) = 4.32:1
// 修正: L を下げる（暗くする）
// ============================================================
console.log("\n【ライトモード】 --muted-foreground vs --muted");
console.log("現状: oklch(0.55 0.01 260) → 4.32:1");
{
  const fix = findOptimalL({
    C: 0.01,
    h: 260,
    bgStr: "oklch(0.96 0.005 260)",
    darken: true,
    startL: 0.55,
  });
  if (fix) {
    console.log(`推奨修正値: oklch(${fix.L} 0.01 260) → ${fix.ratio.toFixed(2)}:1`);
    // background に対するコントラストも確認
    const bgLum = oklchStrToLuminance("oklch(0.985 0.002 260)");
    const fgLum = oklchToLuminance(fix.L, 0.01, 260);
    const ratio2 = contrastRatio(fgLum, bgLum);
    console.log(`  → --background に対するコントラスト: ${ratio2.toFixed(2)}:1`);
  }
}

// ============================================================
// 問題2: ダークモード primary vs primary-foreground
// 現状: oklch(0.65 0.2 270) vs oklch(0.98 0.005 260) = 3.19:1
// 修正: primary の L を下げる（暗くする）
// ============================================================
console.log("\n【ダークモード】 --primary vs --primary-foreground");
console.log("現状: oklch(0.65 0.2 270) → 3.19:1");
{
  const pfgLum = oklchStrToLuminance("oklch(0.98 0.005 260)");
  // primary を暗くしてコントラスト確保
  let L = 0.65;
  let found = null;
  while (L > 0) {
    const pLum = oklchToLuminance(L, 0.2, 270);
    const ratio = contrastRatio(pfgLum, pLum);
    if (ratio >= 4.5) {
      found = { L: Math.round(L * 100) / 100, ratio };
      break;
    }
    L -= 0.01;
  }
  if (found) {
    console.log(`推奨修正値: oklch(${found.L} 0.2 270) → ${found.ratio.toFixed(2)}:1`);
    // ダークモード background との対比も確認
    const bgLum = oklchStrToLuminance("oklch(0.14 0.01 260)");
    const pLum = oklchToLuminance(found.L, 0.2, 270);
    const ratio2 = contrastRatio(pLum, bgLum);
    console.log(`  → dark --background に対するコントラスト: ${ratio2.toFixed(2)}:1`);
  }
}

// ============================================================
// 問題3: ダークモード success vs success-foreground
// 現状: oklch(0.6 0.18 155) vs oklch(0.98 0 0) = 3.33:1
// 修正: success の L を下げる
// ============================================================
console.log("\n【ダークモード】 --success vs --success-foreground");
console.log("現状: oklch(0.6 0.18 155) → 3.33:1");
{
  const sfgLum = oklchStrToLuminance("oklch(0.98 0 0)");
  let L = 0.6;
  let found = null;
  while (L > 0) {
    const sLum = oklchToLuminance(L, 0.18, 155);
    const ratio = contrastRatio(sfgLum, sLum);
    if (ratio >= 4.5) {
      found = { L: Math.round(L * 100) / 100, ratio };
      break;
    }
    L -= 0.01;
  }
  if (found) {
    console.log(`推奨修正値: oklch(${found.L} 0.18 155) → ${found.ratio.toFixed(2)}:1`);
  }
}

// ============================================================
// 問題4: ダークモード destructive vs primary-foreground
// 現状: oklch(0.65 0.2 25) vs oklch(0.98 0.005 260) = 3.36:1
// 修正: destructive の L を下げる
// ============================================================
console.log("\n【ダークモード】 --destructive vs --primary-foreground");
console.log("現状: oklch(0.65 0.2 25) → 3.36:1");
{
  const dfgLum = oklchStrToLuminance("oklch(0.98 0.005 260)");
  let L = 0.65;
  let found = null;
  while (L > 0) {
    const dLum = oklchToLuminance(L, 0.2, 25);
    const ratio = contrastRatio(dfgLum, dLum);
    if (ratio >= 4.5) {
      found = { L: Math.round(L * 100) / 100, ratio };
      break;
    }
    L -= 0.01;
  }
  if (found) {
    console.log(`推奨修正値: oklch(${found.L} 0.2 25) → ${found.ratio.toFixed(2)}:1`);
    // ダークモード foreground との対比も確認
    const fgLum = oklchStrToLuminance("oklch(0.95 0.005 260)");
    const dLum = oklchToLuminance(found.L, 0.2, 25);
    const ratio2 = contrastRatio(fgLum, dLum);
    console.log(`  → dark --foreground との対比: ${ratio2.toFixed(2)}:1`);
  }
}

// ============================================================
// 追加チェック: 変更後に他のペアが壊れないか確認
// ============================================================
console.log("\n" + "=".repeat(60));
console.log("追加チェック: 修正候補で他ペアへの影響を確認");
console.log("=".repeat(60));
