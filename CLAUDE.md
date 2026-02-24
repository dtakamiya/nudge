# Nudge - 1on1 ミーティングトラッカー

## 概要

Nudge は 1on1 ミーティングの記録・管理を行うシングルユーザー向けローカル Web アプリケーション。
メンバー管理、ミーティング記録（トピック・アクションアイテム）、進捗トラッキングを提供する。

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router) + React 19
- **データベース:** Prisma ORM + SQLite
- **スタイリング:** Tailwind CSS 4 + shadcn/ui
- **バリデーション:** Zod 4
- **テスト:** Vitest + Testing Library + jsdom / Playwright (E2E)
- **チャート:** recharts
- **デザインシステム:** Slate & Indigo テーマ（OKLch カラーパレット、Geist Sans）
- **ダークモード:** next-themes
- **アイコン:** lucide-react
- **DnD:** @dnd-kit/core + @dnd-kit/sortable
- **コード品質:** ESLint, Prettier, husky + lint-staged
- **言語:** TypeScript 5 (strict mode)

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router ページ
│   ├── actions/            # アクションアイテム一覧（グループ化・フィルタ対応）
│   ├── analytics/          # アナリティクスページ
│   ├── members/            # メンバー CRUD・ミーティングページ
│   │   ├── [id]/           # メンバー詳細・ミーティング管理
│   │   │   └── meetings/   # ミーティング作成・詳細・準備・リアルタイム記録
│   │   │       ├── new/    # 新規作成
│   │   │       ├── prepare/ # 準備画面（前回未完了アクション引き継ぎ）
│   │   │       └── [meetingId]/ # 詳細・記録画面（印刷/PDF対応）
│   │   └── new/            # メンバー新規作成
│   ├── settings/           # 設定ページ
│   │   └── templates/      # カスタムミーティングテンプレート管理
│   ├── globals.css         # テーマ変数・アニメーション定義
│   ├── layout.tsx          # ルートレイアウト（フォント・サイドバー統合）
│   ├── loading.tsx         # ルートレベル スケルトン UI
│   ├── error.tsx           # エラーバウンダリ
│   ├── not-found.tsx       # 404 ページ
│   └── page.tsx            # ダッシュボード
├── components/
│   ├── action/             # アクションアイテム コンポーネント
│   ├── analytics/          # アナリティクス コンポーネント（recharts グラフ群）
│   ├── dashboard/          # ダッシュボード コンポーネント
│   ├── layout/             # レイアウト コンポーネント（サイドバー・パンくず）
│   ├── meeting/            # ミーティング コンポーネント（DnD・リアルタイム記録・コーチングアシスト含む）
│   ├── member/             # メンバー コンポーネント
│   ├── tag/                # タグ コンポーネント（badge・filter・input）
│   └── ui/                 # shadcn/ui ベースコンポーネント（avatar-initial 含む）
├── generated/prisma/       # Prisma 生成クライアント（gitignore対象）
├── hooks/                  # カスタム React フック
│   ├── use-chart-mounted.ts #  recharts マウント状態管理
│   ├── use-debounce.ts     #   デバウンス
│   ├── use-elapsed-time.ts #   経過時間（リアルタイム記録）
│   └── use-keyboard-shortcuts.ts # キーボードショートカット
└── lib/
    ├── actions/            # Server Actions（データ変更処理）
    ├── validations/        # Zod スキーマ
    ├── avatar.ts           # アバターイニシャル・グラデーション生成
    ├── checkin-messages.ts  # チェックイン応答メッセージ
    ├── coaching-tips.ts     # コーチングアシスト ヒント定義
    ├── condition-diff.ts    # チェックイン前回比較差分ロジック
    ├── constants.ts        # アプリ定数
    ├── dnd-accessibility.ts # DnD アクセシビリティ設定
    ├── due-date.ts          # 期限日計算ユーティリティ
    ├── export.ts            # ミーティングデータエクスポート
    ├── format.ts           # 日付フォーマット ユーティリティ
    ├── group-actions.ts     # アクションアイテム グループ化ロジック
    ├── icebreakers.ts       # アイスブレイク質問集
    ├── meeting-templates.ts # ミーティングテンプレート定義（組み込み）
    ├── mood.ts              # 気分スコア変換ユーティリティ
    ├── prisma.ts           # Prisma クライアント シングルトン
    ├── schedule.ts          # ミーティングスケジュール計算
    ├── toast-messages.ts    # トースト通知メッセージ定義
    └── utils.ts            # 汎用ユーティリティ（cn）
prisma/
├── schema.prisma           # データベーススキーマ
├── seed.ts                 # シードデータ
├── seed-test.ts            # テスト用シードデータ
└── migrations/             # マイグレーションファイル
e2e/                        # Playwright E2E テスト
├── global-setup.ts         # テスト前のグローバルセットアップ
├── helpers.ts              # テストヘルパー関数
└── *.spec.ts               # テストスペックファイル
```

## デザインシステム（Slate & Indigo テーマ）

### タイポグラフィ

- **フォント:** Geist Sans（`font-sans`）、日本語フォールバック Noto Sans JP
- Tailwind ユーティリティ `font-semibold tracking-tight` で見出しスタイルを適用

### カラーパレット

OKLch ベースの寒色系パレット。定義場所: `src/app/globals.css`

- **Primary:** インディゴ（`oklch(0.55 0.2 270)`）
- **Background:** ニュートラルホワイト（`oklch(0.985 0.002 260)`）
- **Destructive:** コーラルレッド（`oklch(0.55 0.2 25)`）

### アニメーション

`globals.css` に定義。クラス名で適用:

- `animate-fade-in-up` — 200ms フェードイン＋上方向スライド
- `animate-slide-in` — 180ms 上方向スライドイン
- `animate-badge-bounce` — バッジバウンス
- `stagger-1` 〜 `stagger-5` — 40ms 刻みの段階的アニメーション遅延

### レイアウト

- **デスクトップ:** 固定サイドバー + メインコンテンツ
- **モバイル:** ハンバーガーメニュー + オーバーレイサイドバー
- 実装: `src/components/layout/sidebar.tsx`

## コマンド

```bash
npm run dev              # 開発サーバー起動（Turbopack）
npm run build            # 本番ビルド
npm run start            # 本番サーバー起動
npm run lint             # ESLint チェック
npm run format           # Prettier で全ファイルフォーマット
npm run format:check     # Prettier チェック（CI用）
npm test                 # テスト実行（vitest run）
npm run test:watch       # テスト ウォッチモード
npm run test:e2e         # E2E テスト実行（Playwright）
npm run test:e2e:ui      # E2E テスト（Playwright UI モード）
npm run test:e2e:headed  # E2E テスト（ブラウザ表示あり）

# データベース
npx prisma migrate dev   # マイグレーション実行
npm run db:seed          # 開発用シードデータ投入
npm run db:seed-test     # テスト用シードデータ投入
npx prisma generate      # Prisma クライアント生成
npx prisma studio        # Prisma Studio 起動
```

コミット時に husky + lint-staged が自動で Prettier フォーマット・ESLint 修正・TypeScript 型チェックを実行する。

## コーディング規約

### Server Actions パターン

- データ変更はすべて `src/lib/actions/` の Next.js Server Actions を使用
- 各アクションは `src/lib/validations/` の Zod スキーマで入力検証
- `"use server"` ディレクティブ必須
- 型付きの結果を返してエラーハンドリング

### 基本ルール

- **イミュータブル:** 既存オブジェクトを変更せず、常に新しいオブジェクトを生成
- **TDD:** テストを先に書く（RED → GREEN → REFACTOR）
- **UI テキスト:** ユーザー向けテキストは日本語
- **主キー:** UUID（`@id @default(uuid())`）
- **パスエイリアス:** インポートは `@/*` を使用（`src/*` にマッピング）
- **ファイルサイズ:** 400行以下推奨（最大800行）
- **関数サイズ:** 50行以下

### データベース

- Prisma ORM 経由で SQLite を使用
- `DATABASE_URL` は `.env` に設定（例: `file:./dev.db`）
- テスト用 DB は `file:./test.db`（vitest.config.ts で設定済み）

### テスト

- テストファイル: `src/**/*.test.{ts,tsx}`（ソースと同階層の `__tests__/` ディレクトリに配置）
- カバレッジ目標: 80% 以上
- ユニットテストでは Prisma クライアントをモック
- コンポーネントテストには `@testing-library/react` を使用

## 1on1 ツール市場での差別化ポイント

- **ローカルファースト**: データをユーザーの手元に保持する安心感（プライバシー重視）
- **シンプルさ**: 多機能化しすぎず、1on1 に特化した使いやすさを維持
- **準備 → 記録 → フォローアップ**: このワークフローをいかにスムーズにするかが鍵
- **マネージャーの負荷軽減**: 自動化・レコメンド・可視化でマネージャーの認知負荷を下げる
- **ベストプラクティスの実践支援**: 1on1のベストプラクティスを自然とサポートし実施できるようにする
