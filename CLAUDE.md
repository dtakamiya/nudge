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
- **言語:** TypeScript 5 (strict mode)

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router ページ
│   ├── actions/            # アクションアイテム一覧
│   ├── members/            # メンバー CRUD・ミーティングページ
│   └── layout.tsx          # ルートレイアウト
├── components/
│   ├── action/             # アクションアイテム コンポーネント
│   ├── meeting/            # ミーティング コンポーネント
│   ├── member/             # メンバー コンポーネント
│   └── ui/                 # shadcn/ui ベースコンポーネント
├── generated/prisma/       # Prisma 生成クライアント（gitignore対象）
└── lib/
    ├── actions/            # Server Actions（データ変更処理）
    ├── validations/        # Zod スキーマ
    ├── prisma.ts           # Prisma クライアント シングルトン
    ├── constants.ts        # アプリ定数
    ├── format.ts           # 日付フォーマット ユーティリティ
    └── utils.ts            # 汎用ユーティリティ（cn）
prisma/
├── schema.prisma           # データベーススキーマ
├── seed.ts                 # シードデータ
└── migrations/             # マイグレーションファイル
```

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
