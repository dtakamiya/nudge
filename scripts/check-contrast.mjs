#!/usr/bin/env node
/**
 * WCAG AA コントラスト比チェッカー
 * OKLch カラーを Hex に変換し、WCAG コントラスト比を計算する
 *
 * 使い方: node scripts/check-contrast.mjs
 */

// ============================================================
// OKLch → linear sRGB 変換
// ============================================================

/**
 * OKLch → OKLab
 * @param {number} L - 明度 (0–1)
 * @param {number} C - 彩度
 * @param {number} h - 色相 (度)
 */
function oklchToOklab(L, C, h) {
  const hRad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(hRad), b: C * Math.sin(hRad) };
}

/**
 * OKLab → linear sRGB
 * Björn Ottosson の仕様に基づく行列変換
 */
function oklabToLinearSrgb(L, a, b) {
  // OKLab → LMS (cube-root space)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  // 3乗でLMSへ
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  // LMS → linear sRGB
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bv = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return { r, g, b: bv };
}

/**
 * OKLch 文字列をパース
 * @param {string} oklchStr - 例: "oklch(0.55 0.01 260)"
 */
function parseOklch(oklchStr) {
  const match = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) throw new Error(`パース失敗: ${oklchStr}`);
  return {
    L: parseFloat(match[1]),
    C: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

/**
 * linear sRGB → relative luminance (WCAG 2.1)
 */
function linearToLuminance(r, g, b) {
  const clamp = (v) => Math.max(0, v);
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b);
}

/**
 * OKLch 文字列 → WCAG 相対輝度
 */
function oklchToLuminance(oklchStr) {
  const { L, C, h } = parseOklch(oklchStr);
  const { L: Lab_L, a, b } = oklchToOklab(L, C, h);
  const { r, g, b: bv } = oklabToLinearSrgb(Lab_L, a, b);
  return linearToLuminance(r, g, bv);
}

/**
 * WCAG コントラスト比を計算
 * @param {number} lum1 - 相対輝度1
 * @param {number} lum2 - 相対輝度2
 */
function contrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG AA 判定
 * 通常テキスト: 4.5:1、大テキスト/UI: 3:1
 */
function wcagAA(ratio, isLargeText = false) {
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold ? "✅ PASS" : "❌ FAIL";
}

// ============================================================
// カラーパレット定義（globals.css から）
// ============================================================

const lightMode = {
  background: "oklch(0.985 0.002 260)",
  foreground: "oklch(0.15 0.01 260)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.15 0.01 260)",
  primary: "oklch(0.55 0.2 270)",
  "primary-foreground": "oklch(0.98 0.005 260)",
  secondary: "oklch(0.96 0.005 260)",
  "secondary-foreground": "oklch(0.25 0.01 260)",
  muted: "oklch(0.96 0.005 260)",
  "muted-foreground": "oklch(0.54 0.01 260)",
  "accent-foreground": "oklch(0.25 0.01 260)",
  accent: "oklch(0.97 0.003 260)",
  destructive: "oklch(0.55 0.2 25)",
  sidebar: "oklch(0.975 0.003 260)",
  "sidebar-foreground": "oklch(0.15 0.01 260)",
  "sidebar-primary": "oklch(0.55 0.2 270)",
  "sidebar-primary-foreground": "oklch(0.98 0.005 260)",
  "sidebar-accent": "oklch(0.94 0.005 260)",
  "sidebar-accent-foreground": "oklch(0.25 0.01 260)",
  success: "oklch(0.5 0.18 155)",
  "success-foreground": "oklch(0.98 0 0)",
  warning: "oklch(0.65 0.15 80)",
  "warning-foreground": "oklch(0.25 0 0)",
};

const darkMode = {
  background: "oklch(0.14 0.01 260)",
  foreground: "oklch(0.95 0.005 260)",
  card: "oklch(0.18 0.01 260)",
  "card-foreground": "oklch(0.95 0.005 260)",
  primary: "oklch(0.56 0.2 270)",
  "primary-foreground": "oklch(0.98 0.005 260)",
  secondary: "oklch(0.24 0.01 260)",
  "secondary-foreground": "oklch(0.9 0.005 260)",
  muted: "oklch(0.22 0.008 260)",
  "muted-foreground": "oklch(0.65 0.01 260)",
  accent: "oklch(0.24 0.01 260)",
  "accent-foreground": "oklch(0.9 0.005 260)",
  destructive: "oklch(0.57 0.2 25)",
  sidebar: "oklch(0.11 0.008 260)",
  "sidebar-foreground": "oklch(0.95 0.005 260)",
  "sidebar-primary": "oklch(0.56 0.2 270)",
  "sidebar-primary-foreground": "oklch(0.98 0.005 260)",
  "sidebar-accent": "oklch(0.2 0.01 260)",
  "sidebar-accent-foreground": "oklch(0.9 0.005 260)",
  success: "oklch(0.52 0.18 155)",
  "success-foreground": "oklch(0.98 0 0)",
  warning: "oklch(0.75 0.15 80)",
  "warning-foreground": "oklch(0.15 0 0)",
};

// ============================================================
// 検証対象のカラーペア
// ============================================================

const checkPairs = [
  { fg: "foreground", bg: "background", label: "本文テキスト" },
  { fg: "muted-foreground", bg: "background", label: "ミュートテキスト（背景上）" },
  { fg: "muted-foreground", bg: "muted", label: "ミュートテキスト（muted背景上）" },
  { fg: "card-foreground", bg: "card", label: "カードテキスト" },
  { fg: "primary-foreground", bg: "primary", label: "プライマリボタン文字" },
  { fg: "secondary-foreground", bg: "secondary", label: "セカンダリ" },
  { fg: "accent-foreground", bg: "accent", label: "アクセント" },
  { fg: "sidebar-foreground", bg: "sidebar", label: "サイドバーテキスト" },
  { fg: "sidebar-primary-foreground", bg: "sidebar-primary", label: "サイドバープライマリ" },
  { fg: "sidebar-accent-foreground", bg: "sidebar-accent", label: "サイドバーアクセント" },
  { fg: "success-foreground", bg: "success", label: "サクセスバッジ" },
  { fg: "warning-foreground", bg: "warning", label: "ワーニングバッジ" },
  { fg: "primary-foreground", bg: "destructive", label: "デストラクティブ（前景）" },
  { fg: "foreground", bg: "destructive", label: "デストラクティブ（本文）", note: "参考" },
];

// ============================================================
// チェック実行
// ============================================================

function runCheck(palette, modeName) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${modeName}`);
  console.log("=".repeat(60));
  console.log(
    `${"カラーペア".padEnd(30)} ${"比率".padEnd(10)} ${"通常".padEnd(10)} ${"大テキスト"}`,
  );
  console.log("-".repeat(70));

  const failures = [];

  for (const { fg, bg, label, note } of checkPairs) {
    if (!palette[fg] || !palette[bg]) continue;
    const lumFg = oklchToLuminance(palette[fg]);
    const lumBg = oklchToLuminance(palette[bg]);
    const ratio = contrastRatio(lumFg, lumBg);
    const passNormal = wcagAA(ratio, false);
    const passLarge = wcagAA(ratio, true);
    const noteStr = note ? ` (${note})` : "";
    console.log(
      `${(label + noteStr).padEnd(30)} ${ratio.toFixed(2).padEnd(10)} ${passNormal.padEnd(12)} ${passLarge}`,
    );
    if (ratio < 4.5) {
      failures.push({ label, fg, bg, ratio, fgColor: palette[fg], bgColor: palette[bg] });
    }
  }

  return failures;
}

const lightFailures = runCheck(lightMode, "ライトモード");
const darkFailures = runCheck(darkMode, "ダークモード");

console.log(`\n${"=".repeat(60)}`);
console.log("WCAG AA 不合格まとめ（通常テキスト 4.5:1 未満）");
console.log("=".repeat(60));

if (lightFailures.length === 0 && darkFailures.length === 0) {
  console.log("✅ 全ペアが WCAG AA 基準を満たしています！");
} else {
  if (lightFailures.length > 0) {
    console.log("\n【ライトモード 不合格】");
    for (const f of lightFailures) {
      console.log(`  ${f.label}: ${f.ratio.toFixed(2)}:1`);
      console.log(`    FG: ${f.fgColor} (--${f.fg})`);
      console.log(`    BG: ${f.bgColor} (--${f.bg})`);
    }
  }
  if (darkFailures.length > 0) {
    console.log("\n【ダークモード 不合格】");
    for (const f of darkFailures) {
      console.log(`  ${f.label}: ${f.ratio.toFixed(2)}:1`);
      console.log(`    FG: ${f.fgColor} (--${f.fg})`);
      console.log(`    BG: ${f.bgColor} (--${f.bg})`);
    }
  }
}
