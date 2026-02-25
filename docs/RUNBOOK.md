# 運用ガイド (RUNBOOK)

> Nudge はシングルユーザー向けローカルアプリケーション。
> 本ガイドはローカル環境での運用・トラブルシューティングを対象とする。
>
> 最終更新: 2026-02-25

## デプロイ手順

### ローカルビルド & 起動

```bash
# 依存パッケージのインストール
npm install

# Prisma クライアント生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate deploy

# 本番ビルド
npm run build

# サーバー起動（デフォルト: http://localhost:3000）
npm run start
```

### 初回セットアップ

```bash
# 環境変数の設定
cp .env.example .env

# Prisma クライアント生成
npx prisma generate

# データベースマイグレーションを適用
npx prisma migrate deploy

# シードデータの投入
npm run db:seed
```

### アップデート手順

```bash
# 最新コードの取得
git pull origin main

# 依存パッケージの更新
npm install

# Prisma クライアント再生成
npx prisma generate

# 新しいマイグレーションの適用
npx prisma migrate deploy

# 本番ビルド
npm run build

# サーバー再起動
npm run start
```

## トラブルシューティング

### ビルドエラー

**症状:** `npm run build` が失敗する

```bash
# 1. TypeScript エラーの確認
npx tsc --noEmit

# 2. ESLint エラーの確認
npm run lint

# 3. Prisma クライアントの再生成
npx prisma generate

# 4. Next.js キャッシュのクリア
rm -rf .next

# 5. node_modules の再インストール
rm -rf node_modules && npm install
```

### データベース関連

**症状:** Prisma エラー、DB 接続失敗

```bash
# 1. .env の DATABASE_URL を確認
cat .env

# 2. マイグレーション状態の確認
npx prisma migrate status

# 3. マイグレーションの再実行
npx prisma migrate dev

# 4. DB のリセット（データは全て消える）
npx prisma migrate reset
```

**症状:** スキーマ変更後にエラー

```bash
# Prisma クライアントを再生成
npx prisma generate

# 開発サーバーを再起動
npm run dev
```

**症状:** "database is locked" エラー（SQLite）

```bash
# 1. 同時に複数のプロセスが DB にアクセスしていないか確認
lsof prisma/dev.db

# 2. Prisma Studio や他の開発サーバーを停止

# 3. 開発サーバーを再起動
npm run dev
```

### テスト関連

**症状:** ユニット/統合テストが失敗する

```bash
# 1. 全テスト実行で状況確認
npm test

# 2. 特定テストのみ実行
npx vitest run src/lib/__tests__/format.test.ts

# 3. テスト DB のリセット
DATABASE_URL="file:./test.db" npx prisma migrate reset --force
```

**症状:** E2E テストが失敗する

```bash
# 1. Playwright ブラウザのインストール確認
npx playwright install

# 2. ヘッドありモードで視覚的に確認
npm run test:e2e:headed

# 3. UI モードでインタラクティブに確認
npm run test:e2e:ui

# 4. 開発サーバーが起動していることを確認
# （E2E は自動でポート 3100 にサーバーを起動するが、競合がないか確認）
lsof -i :3100
```

**症状:** E2E テストのタイムアウト

```bash
# playwright.config.ts の設定:
# - actionTimeout: 10000ms（操作タイムアウト）
# - navigationTimeout: 30000ms（遷移タイムアウト）
# - webServer timeout: 120000ms（サーバー起動タイムアウト）

# サーバー起動が遅い場合は手動で先に起動しておく
npm run dev -- --port 3100
# 別ターミナルで E2E テストを実行
npm run test:e2e
```

### 開発サーバー

**症状:** 開発サーバーが起動しない

```bash
# 1. ポート競合の確認
lsof -i :3000

# 2. Next.js キャッシュのクリア
rm -rf .next

# 3. Prisma クライアントの再生成（初回や worktree 移動後）
npx prisma generate

# 4. 再起動
npm run dev
```

### Prisma Studio

**症状:** Prisma Studio が開かない

```bash
# DATABASE_URL が設定されていることを確認
npx prisma studio
```

### フォーマットエラー

**症状:** プッシュが pre-push フックで拒否される

```bash
# 1. フォーマット違反の確認
npm run format:check

# 2. 自動修正
npm run format

# 3. 変更をコミットして再プッシュ
git add -A && git commit -m "fix: フォーマット修正"
git push
```

## データベーススキーマ

### モデル一覧

| モデル            | 説明                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `Member`          | 1on1 対象メンバー（`meetingIntervalDays` で推奨ミーティング間隔を管理）                   |
| `Meeting`         | ミーティング記録（`mood`, `conditionHealth/Mood/Workload`, `checkinNote`, 開始/終了時刻） |
| `Topic`           | ミーティングのトピック（`sortOrder` で並び替え可能）                                      |
| `ActionItem`      | アクションアイテム（`sortOrder`, `dueDate`, `completedAt` 対応）                          |
| `Tag`             | タグ/ラベル（色付き）                                                                     |
| `TopicTag`        | Topic と Tag の中間テーブル                                                               |
| `ActionItemTag`   | ActionItem と Tag の中間テーブル                                                          |
| `MeetingTemplate` | カスタムミーティングテンプレート（JSON でトピック定義、`isDefault` フラグ対応）           |

### リレーション

```
Member 1--* Meeting
Member 1--* ActionItem
Meeting 1--* Topic
Meeting 1--* ActionItem
Topic *--* Tag (via TopicTag)
ActionItem *--* Tag (via ActionItemTag)
MeetingTemplate（独立テーブル）
```

### Meeting モデルの主要フィールド

| フィールド          | 型          | 説明                                     |
| ------------------- | ----------- | ---------------------------------------- |
| `mood`              | `Int?`      | ミーティング全体の気分スコア             |
| `conditionHealth`   | `Int?`      | チェックイン: 健康状態スコア             |
| `conditionMood`     | `Int?`      | チェックイン: 気分スコア                 |
| `conditionWorkload` | `Int?`      | チェックイン: 業務負荷スコア             |
| `checkinNote`       | `String`    | チェックインメモ（デフォルト空文字）     |
| `startedAt`         | `DateTime?` | ミーティング開始時刻（リアルタイム記録） |
| `endedAt`           | `DateTime?` | ミーティング終了時刻（リアルタイム記録） |

### MeetingTemplate モデル

| フィールド    | 型        | 説明                                     |
| ------------- | --------- | ---------------------------------------- |
| `name`        | `String`  | テンプレート名（ユニーク制約）           |
| `description` | `String`  | テンプレートの説明                       |
| `topics`      | `Json`    | トピック定義（カテゴリ・タイトルの配列） |
| `isDefault`   | `Boolean` | デフォルトテンプレートフラグ             |

### Enum

- `TopicCategory`: WORK_PROGRESS, CAREER, ISSUES, FEEDBACK, OTHER
- `ActionItemStatus`: TODO, IN_PROGRESS, DONE

## バックアップ & リストア

### バックアップ

```bash
# SQLite ファイルをコピー（日付付き）
cp prisma/dev.db "prisma/dev.db.backup.$(date +%Y%m%d)"
```

### リストア

```bash
# バックアップから復元
cp prisma/dev.db.backup prisma/dev.db
```

### 定期バックアップの推奨

SQLite はファイルベースのため、ファイルコピーだけでバックアップが完了する。
重要なデータがある場合は、定期的にバックアップを取ることを推奨する。

```bash
# cron 例（毎日 0 時にバックアップ）
0 0 * * * cp /path/to/nudge/prisma/dev.db /path/to/backup/nudge-$(date +\%Y\%m\%d).db
```

## ログ確認

- **Next.js ログ:** 開発サーバーのコンソール出力
- **Prisma ログ:** `prisma.$on('query', ...)` で有効化可能
- **ブラウザログ:** DevTools Console
- **E2E テストレポート:** `playwright-report/` ディレクトリ（HTML レポート）

## ロールバック手順

### アプリケーションのロールバック

```bash
# 1. DB バックアップ（ロールバック前に現在の DB を保存）
cp prisma/dev.db prisma/dev.db.before-rollback

# 2. 前のコミットに戻す
git checkout <previous-commit> -- prisma/schema.prisma prisma/migrations/

# 3. Prisma クライアント再生成
npx prisma generate

# 4. 必要に応じて DB バックアップを復元
cp prisma/dev.db.backup prisma/dev.db
```

### マイグレーションのロールバック

SQLite はマイグレーションのロールバックが限定的なため、バックアップからの復元が最も安全な方法。

```bash
# 1. 事前にバックアップを確認
ls -la prisma/dev.db.backup*

# 2. バックアップから復元
cp prisma/dev.db.backup prisma/dev.db

# 3. スキーマとマイグレーションを前の状態に戻す
git checkout <previous-commit> -- prisma/schema.prisma prisma/migrations/

# 4. Prisma クライアント再生成
npx prisma generate
```

## 主要機能の Server Actions 一覧

| ファイル                 | 主な機能                                          |
| ------------------------ | ------------------------------------------------- |
| `member-actions.ts`      | メンバー CRUD                                     |
| `meeting-actions.ts`     | ミーティング CRUD、チェックイン、リアルタイム記録 |
| `action-item-actions.ts` | アクションアイテム CRUD、ステータス更新           |
| `tag-actions.ts`         | タグ CRUD、トピック/アクションへの関連付け        |
| `dashboard-actions.ts`   | ダッシュボード KPI データ取得                     |
| `analytics-actions.ts`   | アナリティクス集計データ取得                      |
| `search-actions.ts`      | メンバー・ミーティング検索                        |
| `export-actions.ts`      | ミーティングデータのエクスポート                  |
| `reminder-actions.ts`    | ミーティングリマインダー管理                      |
| `template-actions.ts`    | カスタムミーティングテンプレート CRUD             |
