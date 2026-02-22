# 運用ガイド (RUNBOOK)

> Nudge はシングルユーザー向けローカルアプリケーション。
> 本ガイドはローカル環境での運用・トラブルシューティングを対象とする。

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

# サーバー起動
npm run start
```

### 初回セットアップ

```bash
# 環境変数の設定
cp .env.example .env

# データベース初期化（マイグレーション + シード）
npx prisma migrate dev
npm run db:seed
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

# 4. node_modules の再インストール
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

# 4. DB のリセット（データは消える）
npx prisma migrate reset
```

**症状:** スキーマ変更後にエラー

```bash
# Prisma クライアントを再生成
npx prisma generate

# 開発サーバーを再起動
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

# 4. 開発サーバーが起動していることを確認（E2E はサーバーが必要）
npm run dev
```

### 開発サーバー

**症状:** 開発サーバーが起動しない

```bash
# 1. ポート競合の確認
lsof -i :3000

# 2. Next.js キャッシュのクリア
rm -rf .next

# 3. 再起動
npm run dev
```

### Prisma Studio

**症状:** Prisma Studio が開かない

```bash
# DATABASE_URL が設定されていることを確認
npx prisma studio
```

## データベーススキーマ

### モデル一覧

| モデル          | 説明                                    |
| --------------- | --------------------------------------- |
| `Member`        | 1on1 対象メンバー                       |
| `Meeting`       | ミーティング記録（mood フィールドあり） |
| `Topic`         | ミーティングのトピック                  |
| `ActionItem`    | アクションアイテム                      |
| `Tag`           | タグ/ラベル（色付き）                   |
| `TopicTag`      | Topic と Tag の中間テーブル             |
| `ActionItemTag` | ActionItem と Tag の中間テーブル        |

### リレーション

```
Member 1--* Meeting
Member 1--* ActionItem
Meeting 1--* Topic
Meeting 1--* ActionItem
Topic *--* Tag (via TopicTag)
ActionItem *--* Tag (via ActionItemTag)
```

### Enum

- `TopicCategory`: WORK_PROGRESS, CAREER, ISSUES, FEEDBACK, OTHER
- `ActionItemStatus`: TODO, IN_PROGRESS, DONE

## バックアップ & リストア

### バックアップ

```bash
# SQLite ファイルをコピー
cp prisma/dev.db prisma/dev.db.backup
```

### リストア

```bash
# バックアップから復元
cp prisma/dev.db.backup prisma/dev.db
```

## ログ確認

- **Next.js ログ:** 開発サーバーのコンソール出力
- **Prisma ログ:** `prisma.$on('query', ...)` で有効化可能
- **ブラウザログ:** DevTools Console

## ロールバック手順

```bash
# 直前のマイグレーションをロールバック
# 注意: SQLite はマイグレーションのロールバックが限定的
# 安全な方法: バックアップから復元

# 1. DB バックアップ復元
cp prisma/dev.db.backup prisma/dev.db

# 2. 前のコミットに戻す
git checkout <previous-commit> -- prisma/schema.prisma prisma/migrations/

# 3. Prisma クライアント再生成
npx prisma generate
```
