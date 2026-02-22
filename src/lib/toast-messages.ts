export const TOAST_MESSAGES = {
  member: {
    createSuccess: "メンバーを登録しました",
    createError: "メンバーの登録に失敗しました",
    updateSuccess: "メンバー情報を更新しました",
    updateError: "メンバー情報の更新に失敗しました",
    deleteSuccess: "メンバーを削除しました",
    deleteError: "メンバーの削除に失敗しました",
  },
  meeting: {
    createSuccess: "1on1を保存しました",
    createError: "1on1の保存に失敗しました",
    updateSuccess: "1on1を更新しました",
    updateError: "1on1の更新に失敗しました",
    deleteSuccess: "ミーティングを削除しました",
    deleteError: "ミーティングの削除に失敗しました",
  },
  actionItem: {
    statusChangeSuccess: "ステータスを更新しました",
    statusChangeError: "ステータスの更新に失敗しました",
    updateSuccess: "アクションアイテムを更新しました",
    updateError: "アクションアイテムの更新に失敗しました",
  },
  prepare: {
    topicCopied: "話題をアジェンダにコピーしました",
  },
} as const;
