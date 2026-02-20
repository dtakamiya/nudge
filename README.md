# Nudge - 1on1 ミーティングトラッカー

Nudge は 1on1 ミーティングの記録・管理を行うシングルユーザー向けローカル Web アプリケーションです。
メンバー管理、ミーティング記録（トピック・アクションアイテム）、進捗トラッキングを提供します。

## 主な機能

- **メンバー管理** — 1on1 対象メンバーの登録・編集・削除
- **1on1 ミーティング記録** — トピック・メモの記録と履歴管理
- **アクションアイテム管理** — ミーティングで決まった TODO の追跡・ステータス管理
- **レスポンシブサイドバー** — デスクトップ固定サイドバー / モバイルハンバーガーオーバーレイ

## 技術スタック

| カテゴリ         | 技術                                                |
| ---------------- | --------------------------------------------------- |
| フレームワーク   | Next.js 16 (App Router) + React 19                  |
| データベース     | Prisma ORM + SQLite                                 |
| スタイリング     | Tailwind CSS 4 + shadcn/ui                          |
| デザインシステム | Hearth テーマ（OKLch カラーパレット、Google Fonts） |
| バリデーション   | Zod 4                                               |
| テスト           | Vitest + Testing Library + jsdom                    |
| アイコン         | lucide-react                                        |
| コード品質       | ESLint, Prettier, husky + lint-staged               |
| 言語             | TypeScript 5 (strict mode)                          |

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/dtakamiya/nudge.git
cd nudge

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env の DATABASE_URL を確認（デフォルト: file:./dev.db）

# データベースをセットアップ
npx prisma migrate dev
npx prisma db seed

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 開発コマンド

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint チェック
npm run format       # Prettier で全ファイルフォーマット
npm run format:check # Prettier チェック

# テスト
npm test             # テスト実行（vitest run）
npm run test:watch   # テスト ウォッチモード

# データベース
npx prisma migrate dev   # マイグレーション実行
npx prisma db seed       # シードデータ投入
npx prisma generate      # Prisma クライアント生成
npx prisma studio        # Prisma Studio 起動
```

## プロジェクト構造

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
│   └── ui/                 # shadcn/ui ベースコンポーネント
├── generated/prisma/       # Prisma 生成クライアント
└── lib/
    ├── actions/            # Server Actions
    ├── validations/        # Zod スキーマ
    ├── avatar.ts           # アバターイニシャル・グラデーション生成
    ├── prisma.ts           # Prisma クライアント シングルトン
    ├── constants.ts        # アプリ定数
    ├── format.ts           # 日付フォーマット ユーティリティ
    └── utils.ts            # 汎用ユーティリティ
prisma/
├── schema.prisma           # データベーススキーマ
├── seed.ts                 # シードデータ
└── migrations/             # マイグレーションファイル
```
