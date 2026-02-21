# 開発ガイド (CONTRIB)

> Source of truth: `package.json`, `.env.example`

## 環境セットアップ

### 前提条件

- Node.js 20+
- npm 10+
- Git

### 初期セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/dtakamiya/nudge.git
cd nudge

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env

# データベースのセットアップ
npx prisma migrate dev
npx prisma db seed

# Prisma クライアントの生成
npx prisma generate

# 開発サーバーの起動
npm run dev
```

## npm スクリプト一覧

| コマンド               | 実行内容             | 説明                                   |
| ---------------------- | -------------------- | -------------------------------------- |
| `npm run dev`          | `next dev`           | 開発サーバー起動（ホットリロード付き） |
| `npm run build`        | `next build`         | 本番用ビルド                           |
| `npm run start`        | `next start`         | 本番サーバー起動                       |
| `npm run lint`         | `eslint`             | ESLint による静的解析                  |
| `npm test`             | `vitest run`         | テスト実行（単発）                     |
| `npm run test:watch`   | `vitest`             | テスト実行（ウォッチモード）           |
| `npm run format`       | `prettier --write .` | Prettier で全ファイルフォーマット      |
| `npm run format:check` | `prettier --check .` | Prettier フォーマットチェック（CI 用） |
| `npm run prepare`      | `husky`              | Git フック設定（自動実行）             |

## データベースコマンド

| コマンド                 | 説明                             |
| ------------------------ | -------------------------------- |
| `npx prisma migrate dev` | マイグレーション実行（開発環境） |
| `npx prisma db seed`     | シードデータ投入                 |
| `npx prisma generate`    | Prisma クライアント生成          |
| `npx prisma studio`      | Prisma Studio（DB GUI）起動      |

## 環境変数

| 変数名         | 必須 | 説明                            | 例              |
| -------------- | ---- | ------------------------------- | --------------- |
| `DATABASE_URL` | Yes  | SQLite データベースファイルパス | `file:./dev.db` |

- テスト環境では `vitest.config.ts` で `DATABASE_URL=file:./test.db` に自動設定される

## 開発ワークフロー

### Git ブランチ戦略

1. `main` ブランチから git worktree で作業ブランチを作成
2. 機能実装は worktree 内で行う
3. 完了後: プッシュ → PR 作成 → worktree クリーンアップ
4. `main` には直接コミットしない

### コミットメッセージ

```
<type>: <description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### コミット時の自動チェック（lint-staged）

コミット時に husky + lint-staged により以下が自動実行される:

- `*.{ts,tsx,js,jsx,mjs,json,css,md}` → Prettier フォーマット
- `*.{ts,tsx}` → ESLint 修正 + TypeScript 型チェック

## テスト

### テストの実行

```bash
# 全テスト実行
npm test

# ウォッチモードで実行
npm run test:watch
```

### テスト構成

- **フレームワーク:** Vitest + Testing Library + jsdom
- **テストファイル:** `src/**/__tests__/*.test.{ts,tsx}`
- **カバレッジ目標:** 80% 以上
- **テスト DB:** `file:./test.db`（開発 DB とは分離）

### TDD ワークフロー

1. テストを書く（RED）
2. テスト実行 → 失敗を確認
3. 最小限の実装（GREEN）
4. テスト実行 → 成功を確認
5. リファクタリング（REFACTOR）
6. カバレッジ確認（80%+）

## コーディング規約

- **イミュータブル:** 既存オブジェクトを変更せず、新しいオブジェクトを生成
- **UI テキスト:** ユーザー向けは日本語
- **パスエイリアス:** `@/*` → `src/*`
- **ファイルサイズ:** 400 行以下推奨（最大 800 行）
- **関数サイズ:** 50 行以下
- **主キー:** UUID（`@id @default(uuid())`）

## 技術スタック

| カテゴリ       | 技術                                  |
| -------------- | ------------------------------------- |
| フレームワーク | Next.js 16 (App Router) + React 19    |
| データベース   | Prisma ORM + SQLite                   |
| スタイリング   | Tailwind CSS 4 + shadcn/ui            |
| バリデーション | Zod 4                                 |
| テスト         | Vitest + Testing Library + jsdom      |
| アイコン       | lucide-react                          |
| DnD            | @dnd-kit/core + @dnd-kit/sortable     |
| コード品質     | ESLint, Prettier, husky + lint-staged |
| 言語           | TypeScript 5 (strict mode)            |
