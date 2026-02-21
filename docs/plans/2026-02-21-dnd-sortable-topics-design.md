# トピック・アクションアイテム ドラッグ&ドロップ並び替え 設計

## 概要

1on1 記録フォーム（`MeetingForm`）のトピックとアクションアイテムに、ドラッグ&ドロップによる並び替え機能を追加する。

## 背景

現在のフォームではトピック・アクションアイテムの順番は追加順で固定されている。ユーザーが話題の優先度やアクションの重要度に応じて自由に並び替えたい。

## 技術選定

### 採用: `@dnd-kit/core` + `@dnd-kit/sortable`

- React 向け軽量 DnD ライブラリ（~15KB gzip）
- キーボード・スクリーンリーダー対応がビルトイン
- `@dnd-kit/sortable` でソートに特化した簡潔な API
- React エコシステムで広く使用されている

### 不採用

- **ボタン式上下移動:** 操作感が地味、多数のアイテムで非効率
- **HTML Drag and Drop API:** キーボード非対応、モバイルタッチ非対応、実装が煩雑

## 依存パッケージ

```
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

## コンポーネント構成

```
MeetingForm
├── Topics セクション
│   └── DndContext + SortableContext
│       └── SortableTopicItem[]
│           ├── GripVertical ドラッグハンドル
│           ├── カテゴリ Select
│           ├── タイトル Input
│           ├── メモ Textarea
│           └── 削除ボタン
├── ActionItems セクション
│   └── DndContext + SortableContext
│       └── SortableActionItem[]
│           ├── GripVertical ドラッグハンドル
│           ├── タイトル Input
│           ├── 期限 Input
│           ├── 説明 Input
│           └── 削除ボタン
└── 送信ボタン
```

## ドラッグ動作

- **トリガー:** 各アイテム左端の GripVertical アイコン
- **キーボード:** グリップにフォーカス → Space で掴む → 矢印キーで移動 → Space で確定
- **ビジュアル:** ドラッグ中は `opacity-50` + `ring-2 ring-primary`
- **ドロップ後:** `sortOrder` を配列インデックスに基づいて再計算

## 変更ファイル一覧

| ファイル                                                         | 変更種別 | 内容                                                                                |
| ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `src/components/meeting/meeting-form.tsx`                        | 修正     | DndContext/SortableContext でラップ、トピック・アクション行を新コンポーネントに置換 |
| `src/components/meeting/sortable-topic-item.tsx`                 | 新規     | useSortable フックを使ったドラッグ可能トピック行                                    |
| `src/components/meeting/sortable-action-item.tsx`                | 新規     | useSortable フックを使ったドラッグ可能アクションアイテム行                          |
| `src/components/meeting/__tests__/meeting-form.test.tsx`         | 修正     | 並び替え後の sortOrder 更新テスト追加                                               |
| `src/components/meeting/__tests__/sortable-topic-item.test.tsx`  | 新規     | コンポーネント単体テスト                                                            |
| `src/components/meeting/__tests__/sortable-action-item.test.tsx` | 新規     | コンポーネント単体テスト                                                            |

## データモデル

- DB スキーマ変更: **不要**（Topic には既に `sortOrder` あり、ActionItem は配列順で保存）
- フォーム内の `ActionFormData` 型に `sortOrder` フィールドを追加

## テスト戦略

- **ユニットテスト:** SortableTopicItem / SortableActionItem のレンダリング、props 受け渡し
- **統合テスト:** MeetingForm でアイテム追加後の sortOrder 正確性
- **手動確認:** ドラッグ&ドロップの視覚的動作
