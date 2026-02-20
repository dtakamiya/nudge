# ダッシュボード強化 デザインドキュメント

日付: 2026-02-21

## 概要

ダッシュボード（`/` ページ）に KPI サマリーカードを追加し、メンバーリストに状態情報を追加することで、1on1 の全体状況を一目で把握できるようにする。

## 目的

- 1on1 のフォローアップ漏れを防ぐ
- アクションアイテムの進捗を可視化する
- メンバーごとの 1on1 状況を素早く確認できるようにする

## デザイン

### 1. KPI サマリーカード

ダッシュボード上部に4つのサマリーカードを横並びで配置する。

| カード           | 内容                               | アイコン        | 色分け                                        |
| ---------------- | ---------------------------------- | --------------- | --------------------------------------------- |
| 要フォロー       | 14日以上 1on1 未実施のメンバー数   | `AlertTriangle` | 0人: sage / 1+人: terracotta                  |
| アクション完了率 | 完了数 / 全数 のパーセンテージ     | `CheckCircle`   | 80%+: sage / 50-79%: amber / <50%: terracotta |
| 今月の 1on1      | 当月の実施回数                     | `Calendar`      | 常に primary (amber)                          |
| 期限超過         | dueDate を過ぎた未完了アクション数 | `Clock`         | 0件: sage / 1+件: terracotta                  |

**レイアウト:**

- デスクトップ: 4列横並び（`grid-cols-4`）
- モバイル: 2x2 グリッド（`grid-cols-2`）
- Hearth デザイン準拠のカードスタイル

### 2. メンバーリスト強化

既存のメンバーカードに以下を追加する。

| 要素               | 表示内容               | ビジュアル                                           |
| ------------------ | ---------------------- | ---------------------------------------------------- |
| 最終 1on1 経過日数 | 「3日前」「2週間前」等 | 14日以上: terracotta / 7-13日: amber / 7日未満: sage |
| 未完了アクション数 | 「アクション 2件」     | 数値バッジ（0件は非表示）                            |
| 期限超過アクション | 「期限超過 1件」       | terracotta テキスト（0件は非表示）                   |

**並び順:** デフォルトで最終 1on1 が古い順にソート（フォローが必要なメンバーが上）

## アーキテクチャ

### 新規 Server Action

`src/lib/actions/dashboard-actions.ts` に `getDashboardSummary()` を追加。

```typescript
type DashboardSummary = {
  needsFollowUp: number; // 14日以上 1on1 なしのメンバー数
  actionCompletionRate: number; // アクション完了率 (0-100)
  totalActions: number; // 全アクション数
  completedActions: number; // 完了アクション数
  meetingsThisMonth: number; // 今月の 1on1 実施数
  overdueActions: number; // 期限超過の未完了アクション数
};
```

### 既存 Server Action 拡張

`getMembers()` の返却データに以下を追加:

- `lastMeetingDate: Date | null` — 最終 1on1 日時
- `pendingActionCount: number` — 未完了アクション数
- `overdueActionCount: number` — 期限超過アクション数

### コンポーネント構成

- `src/components/dashboard/dashboard-summary.tsx` — サマリーカード表示（新規）
- `src/components/member/member-list.tsx` — メンバーリスト（拡張）
- `src/app/page.tsx` — ダッシュボードページ（統合）

### テスト

- `getDashboardSummary()` のユニットテスト
- `getMembers()` 拡張部分のテスト
- `DashboardSummary` コンポーネントのレンダリングテスト

## 技術的制約

- 新規ライブラリの追加なし（既存の shadcn/ui + lucide-react で実装）
- SQLite + Prisma の既存データモデルで対応可能
- Hearth デザインシステムに準拠
