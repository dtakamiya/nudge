/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      // 本番ビルドを起動してから計測する
      startServerCommand: "npm start",
      startServerReadyPattern: "Ready on",
      startServerReadyTimeout: 30000,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/members",
        "http://localhost:3000/analytics",
      ],
      numberOfRuns: 3,
      settings: {
        // モバイルエミュレーションを無効化（デスクトップ向けアプリのため）
        preset: "desktop",
        // JavaScript を無効化しない（SPA のため必須）
        disableStorageReset: false,
      },
    },
    assert: {
      assertions: {
        // Core Web Vitals
        // LCP (Largest Contentful Paint): 4000ms 超で error
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        // CLS (Cumulative Layout Shift): 0.25 超で error
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.25 }],
        // TBT (Total Blocking Time, INP/FID の代替): 600ms 超で warn
        "total-blocking-time": ["warn", { maxNumericValue: 600 }],
        // FCP (First Contentful Paint): 3000ms 超で warn
        "first-contentful-paint": ["warn", { maxNumericValue: 3000 }],

        // Lighthouse スコア閾値
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],

        // 主要な監査項目
        "render-blocking-resources": ["warn", { maxLength: 0 }],
        "uses-optimized-images": "off",
        "uses-responsive-images": "off",
      },
    },
    upload: {
      // ローカルファイルシステムに保存（外部送信なし）
      // GitHub Actions artifact として保存し、PR コメントにテキストで掲載する
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
