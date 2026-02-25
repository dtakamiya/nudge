# 開発ガイド (CONTRIB)

> Source of truth: `package.json`, `.env.example`, `vitest.config.ts`, `playwright.config.ts`
>
> 最終更新: 2026-02-25

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

# Prisma クライアントの生成
npx prisma generate

# データベースのセットアップ
npx prisma migrate dev

# シードデータの投入
npm run db:seed

# 開発サーバーの起動
npm run dev
```

### git worktree での開発

```bash
# worktree の作成
git worktree add .worktrees/feat/my-feature -b feat/my-feature

# worktree に .env をコピー
cp .env .worktrees/feat/my-feature/.env

# worktree 内で Prisma クライアントを生成
cd .worktrees/feat/my-feature
DATABASE_URL="file:./dev.db" npx prisma generate

# テスト用 DB のセットアップ（worktree 内）
DATABASE_URL="file:./test.db" npx prisma migrate deploy
```

## npm スクリプト一覧

> **注意:** `npm run dev` 実行前に `predev` フックが自動実行される。`node_modules` が存在しない場合はエラーで停止するので、先に `npm install` を実行すること。

| コマンド                  | 実行内容                   | 説明                                           |
| ------------------------- | -------------------------- | ---------------------------------------------- |
| `npm run dev`             | `next dev --turbo`         | 開発サーバー起動（Turbopack + ホットリロード） |
| `npm run build`           | `next build`               | 本番用ビルド                                   |
| `npm run start`           | `next start`               | 本番サーバー起動                               |
| `npm run lint`            | `eslint`                   | ESLint による静的解析                          |
| `npm test`                | `vitest run`               | ユニット/統合テスト実行（単発）                |
| `npm run test:watch`      | `vitest`                   | テスト実行（ウォッチモード）                   |
| `npm run test:e2e`        | `playwright test`          | E2E テスト実行                                 |
| `npm run test:e2e:ui`     | `playwright test --ui`     | E2E テスト実行（Playwright UI モード）         |
| `npm run test:e2e:headed` | `playwright test --headed` | E2E テスト実行（ブラウザ表示あり）             |
| `npm run format`          | `prettier --write .`       | Prettier で全ファイルフォーマット              |
| `npm run format:check`    | `prettier --check .`       | Prettier フォーマットチェック（CI 用）         |
| `npm run db:seed`         | `tsx prisma/seed.ts`       | 開発用シードデータ投入                         |
| `npm run db:seed-test`    | `tsx prisma/seed-test.ts`  | テスト用シードデータ投入                       |
| `npm run prepare`         | `husky`                    | Git フック設定（自動実行）                     |

## データベースコマンド

| コマンド                    | 説明                                |
| --------------------------- | ----------------------------------- |
| `npx prisma migrate dev`    | マイグレーション実行（開発環境）    |
| `npx prisma migrate deploy` | マイグレーション適用（本番/テスト） |
| `npx prisma migrate status` | マイグレーション状態の確認          |
| `npx prisma migrate reset`  | DB リセット（全データ消去）         |
| `npx prisma generate`       | Prisma クライアント生成             |
| `npx prisma studio`         | Prisma Studio（DB GUI）起動         |
| `npm run db:seed`           | 開発用シードデータ投入              |
| `npm run db:seed-test`      | テスト用シードデータ投入            |

## 環境変数

`.env.example` で定義されている変数:

| 変数名         | 必須 | 説明                            | デフォルト      |
| -------------- | ---- | ------------------------------- | --------------- |
| `DATABASE_URL` | Yes  | SQLite データベースファイルパス | `file:./dev.db` |

- テスト環境では `vitest.config.ts` で `DATABASE_URL=file:./test.db` に自動設定される
- E2E テストでは `playwright.config.ts` で `BASE_URL` と `CI` 環境変数を参照

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

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `ux`

### Git フック

#### pre-commit（husky + lint-staged）

コミット時に以下が自動実行される:

- `*.{ts,tsx,js,jsx,mjs,json,css,md}` → Prettier フォーマット
- `*.{ts,tsx}` → ESLint 修正 + TypeScript 型チェック（`tsc --noEmit`）

#### pre-push

プッシュ前に `npm run format:check` が実行される。フォーマット違反があるとプッシュが拒否される。

> **注意:** lint-staged はステージングされたファイルのみ処理するため、新規ディレクトリのファイルがフォーマット漏れになる場合がある。プッシュ前に `npm run format:check` で全体を確認する。

## テスト

### テストの実行

```bash
# 全テスト実行
npm test

# ウォッチモードで実行
npm run test:watch

# 特定のテストファイルのみ実行
npx vitest run src/lib/__tests__/format.test.ts
```

### テスト構成

- **ユニット/統合テスト:** Vitest + Testing Library + jsdom
- **E2E テスト:** Playwright（`@playwright/test`）
- **テストデータ:** `@faker-js/faker` でランダムデータ生成
- **テストファイル:** `src/**/__tests__/*.test.{ts,tsx}`
- **カバレッジ目標:** 80% 以上
- **テスト DB:** `file:./test.db`（開発 DB とは分離）
- **テスト並列化:** Vitest は `fileParallelism: false`（SQLite ロック回避）

### E2E テスト

```bash
# E2E テスト実行
npm run test:e2e

# UI モードで確認しながら実行
npm run test:e2e:ui

# ブラウザ表示あり（デバッグ用）
npm run test:e2e:headed
```

E2E テストの設定詳細（`playwright.config.ts`）:

- **テストディレクトリ:** `e2e/`
- **ブラウザ:** Chromium（Desktop Chrome）のみ
- **並列実行:** 無効（SQLite ロック回避のため `workers: 1`）
- **開発サーバー:** テスト実行時に自動起動（ポート 3100、CI では 3000）
- **失敗時の記録:** スクリーンショット、ビデオ、トレースを自動保存
- **レポート:** HTML + JUnit XML

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
- **Server Actions:** データ変更は全て `src/lib/actions/` に配置、Zod スキーマで入力検証
- **トースト通知:** メッセージは `src/lib/toast-messages.ts` に集約

## 技術スタック

| カテゴリ       | 技術                                          |
| -------------- | --------------------------------------------- |
| フレームワーク | Next.js 16 (App Router) + React 19            |
| データベース   | Prisma ORM + SQLite                           |
| スタイリング   | Tailwind CSS 4 + shadcn/ui                    |
| テーマ         | next-themes（ダークモード対応）               |
| バリデーション | Zod 4                                         |
| チャート       | recharts                                      |
| テスト         | Vitest + Testing Library + jsdom + Playwright |
| テストデータ   | @faker-js/faker                               |
| アイコン       | lucide-react                                  |
| DnD            | @dnd-kit/core + @dnd-kit/sortable             |
| 通知           | sonner                                        |
| 日付           | date-fns + react-day-picker                   |
| コード品質     | ESLint, Prettier, husky + lint-staged         |
| 言語           | TypeScript 5 (strict mode)                    |
