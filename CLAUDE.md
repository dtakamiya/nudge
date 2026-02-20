# Nudge - 1on1 ミーティングトラッカー

## 概要

Nudge は 1on1 ミーティングの記録・管理を行うシングルユーザー向けローカル Web アプリケーション。
メンバー管理、ミーティング記録（トピック・アクションアイテム）、進捗トラッキングを提供する。

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router) + React 19
- **データベース:** Prisma ORM + SQLite
- **スタイリング:** Tailwind CSS 4 + shadcn/ui
- **バリデーション:** Zod 4
- **テスト:** Vitest + Testing Library + jsdom
- **デザインシステム:** Slate & Indigo テーマ（OKLch カラーパレット、Geist Sans）
- **アイコン:** lucide-react
- **コード品質:** ESLint, Prettier, husky + lint-staged
- **言語:** TypeScript 5 (strict mode)

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router ページ
│   ├── actions/            # アクションアイテム一覧
│   ├── members/            # メンバー CRUD・ミーティングページ
│   ├── globals.css         # テーマ変数・アニメーション定義
│   ├── layout.tsx          # ルートレイアウト（フォント・サイドバー統合）
│   └── page.tsx            # ダッシュボード
├── components/
│   ├── action/             # アクションアイテム コンポーネント
│   ├── layout/             # レイアウト コンポーネント（サイドバー）
│   ├── meeting/            # ミーティング コンポーネント
│   ├── member/             # メンバー コンポーネント
│   └── ui/                 # shadcn/ui ベースコンポーネント（avatar-initial 含む）
├── generated/prisma/       # Prisma 生成クライアント（gitignore対象）
└── lib/
    ├── actions/            # Server Actions（データ変更処理）
    ├── validations/        # Zod スキーマ
    ├── avatar.ts           # アバターイニシャル・グラデーション生成
    ├── prisma.ts           # Prisma クライアント シングルトン
    ├── constants.ts        # アプリ定数
    ├── format.ts           # 日付フォーマット ユーティリティ
    └── utils.ts            # 汎用ユーティリティ（cn）
prisma/
├── schema.prisma           # データベーススキーマ
├── seed.ts                 # シードデータ
└── migrations/             # マイグレーションファイル
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
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint チェック
npm run format       # Prettier で全ファイルフォーマット
npm run format:check # Prettier チェック（CI用）
npm test             # テスト実行（vitest run）
npm run test:watch   # テスト ウォッチモード

# データベース
npx prisma migrate dev   # マイグレーション実行
npx prisma db seed       # シードデータ投入
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
